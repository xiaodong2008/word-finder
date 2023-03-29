// api page - /paragraph/generate
// Generate a paragraph using chatGPT-3.5 api

// Method: POST
// Path: /paragraph/generate
// Data: { words, level, subject }

const { Configuration, OpenAIApi } = require("openai");
const secret = require("../../secret.json");
const {response} = require("../../modules/http.js");
const {getConfig} = require("../../modules/config.js")
const config = getConfig()
const {getUTCDate} = require("../../modules/date.js")

async function generate(req, res, mysql) {
  // response(req, res, 200, {"paragraph":"\n\nThe taco was delicious. The meat was flavorful and the toppings were freshly prepared. The tortilla was light and crunchy, and the cheese was melted perfectly.\n\nThe taco--like, whoa. Flavorful meat, fresh toppings, crunchy tortilla, melty cheese--totally yum, man. Ridic amazing! Deliciousness to the max, no doubt. Ready to chow down? Yeah, you know it!"})
  const login = await mysql.user.islogin(req, res, mysql.query)
  if (!login) response(req, res, 401, "Error 401: Login required")
  let user = await mysql.user.userdata(req, res, mysql.query, login.userid)

  // if user has no word, return 403
  if (user.word <= 0) return response(req, res, 403, "No word left, recharge and try again")

  // if not in config.paragraph.generate.xxx, return 400
  if (!config.paragraph.generate.words.includes(req.body?.words)) return response(req, res, 400, "Error 400: Bad Request 1")
  if (!config.paragraph.generate.subject.includes(req.body?.subject)) return response(req, res, 400, "Error 400: Bad Request 2")
  if (!config.paragraph.generate.level.includes(req.body?.level)) return response(req, res, 400, "Error 400: Bad Request 3")

  const configuration = new Configuration({
    apiKey: secret.openai,
  });
  const openai = new OpenAIApi(configuration);

  const completionConfig = {
    model: "text-babbage-001",
    prompt: `Write a paragraph/blog/... with about ${req.body?.words} words, use ${req.body?.level}-level word, about ${req.body?.subject}.\nParagraph: `,
    temperature: 0.9,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0.0,
    presence_penalty: 0.6,
    stop: ["Paragraph: "],
  }

  let completion = await openai.createCompletion(completionConfig);

  // delete \n at first
  let paragraph = completion.data.choices[0].text

  // if words - paragraph > 20, continue to generate, send message 'continue' to chatGPT
  while ((req.body?.words - paragraph.split(" ").length) > 20) {
    completionConfig.prompt += "continue\nParagraph: "
    completion = await openai.createCompletion(completionConfig);
    paragraph += completion.data.choices[0].text
  }

  // if paragraph not end with '.' or '?' or '!', delete the word after the last '.' or '?' or '!'
  if (!paragraph.match(/[.?!]$/)) {
    paragraph = paragraph.replace(/[.?!] .*$/, "")
  }

  // remove break line
  paragraph = paragraph.replace(/\n/g, "")

  const words = paragraph.split(" ").length

  // update user word
  await mysql.query(req, res,
    "INSERT INTO `word-history` (`target`, `word`, `reason`, `operate`, `date`, `newWord`) VALUES (?, ?, ?, ?, ?, ?)",
    [user.username, -words, "Generate paragraph", "System", getUTCDate(), user.word - words])

  // insert to paragraph history
  await mysql.query(req, res,
    "INSERT INTO `paragraph-history` (`paragraph`, `word`, `user`, `date`) VALUES (?, ?, ?, ?)",
    [paragraph, words, user.username, getUTCDate()])

  return response(req, res, 200, {
    paragraph,
    newWord: user.word - words
  })
}

module.exports = generate;