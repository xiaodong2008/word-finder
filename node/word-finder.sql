/*
 Navicat MySQL Data Transfer

 Source Server         : Local Mysql 8.0
 Source Server Type    : MySQL
 Source Server Version : 80032 (8.0.32)
 Source Host           : localhost:3306
 Source Schema         : word-finder

 Target Server Type    : MySQL
 Target Server Version : 80032 (8.0.32)
 File Encoding         : 65001

 Date: 12/04/2023 15:48:19
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for dictionary
-- ----------------------------
DROP TABLE IF EXISTS `dictionary`;
CREATE TABLE `dictionary` (
  `user` varchar(50) NOT NULL,
  `word` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `date` datetime NOT NULL,
  KEY `user_index` (`user`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for paragraph-history
-- ----------------------------
DROP TABLE IF EXISTS `paragraph-history`;
CREATE TABLE `paragraph-history` (
  `paragraph` varchar(3000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `word` bigint NOT NULL,
  `user` varchar(50) NOT NULL,
  `date` datetime NOT NULL,
  KEY `user_index` (`user`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for redeem
-- ----------------------------
DROP TABLE IF EXISTS `redeem`;
CREATE TABLE `redeem` (
  `code` varchar(24) NOT NULL,
  `itemid` int NOT NULL,
  `quantity` int NOT NULL,
  `repeat` tinyint NOT NULL DEFAULT '0' COMMENT 'Repeat - Can Repeat Redeem For One User\nTinyint - 0 / 1 / 2\n\n0 - No for this\n1 - Yes\n2 - No for id',
  `word` int NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`code`),
  KEY `type` (`itemid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for redeem-history
-- ----------------------------
DROP TABLE IF EXISTS `redeem-history`;
CREATE TABLE `redeem-history` (
  `redeemId` varchar(38) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'RedeemId - Only one\n\nDate(8) - 20221001\nTime(4) - 2356\nUserid(19) - 0000000000000031632\nOTL One Time Token(5) - \\n{5}\n\n202210012356000000000000003163213193(36)',
  `userid` int NOT NULL,
  `code` varchar(24) NOT NULL,
  `word` int NOT NULL,
  `time` datetime NOT NULL,
  `type` int NOT NULL,
  PRIMARY KEY (`redeemId`),
  KEY `userid_index` (`userid`) USING BTREE,
  KEY `code_index` (`code`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for userdata
-- ----------------------------
DROP TABLE IF EXISTS `userdata`;
CREATE TABLE `userdata` (
  `userid` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(50) NOT NULL,
  `word` bigint NOT NULL DEFAULT '0',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `joinTime` datetime NOT NULL,
  PRIMARY KEY (`userid`,`username`) USING BTREE,
  UNIQUE KEY `username_index` (`username`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for userlogin
-- ----------------------------
DROP TABLE IF EXISTS `userlogin`;
CREATE TABLE `userlogin` (
  `token` varchar(64) NOT NULL,
  `userid` bigint NOT NULL,
  `username` varchar(50) NOT NULL,
  `ip` varchar(15) NOT NULL,
  `time` datetime NOT NULL,
  `expireTime` datetime NOT NULL,
  PRIMARY KEY (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for userlogin-failed
-- ----------------------------
DROP TABLE IF EXISTS `userlogin-failed`;
CREATE TABLE `userlogin-failed` (
  `ip` varchar(15) NOT NULL,
  `time` datetime NOT NULL,
  `reason` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for word-history
-- ----------------------------
DROP TABLE IF EXISTS `word-history`;
CREATE TABLE `word-history` (
  `target` varchar(100) NOT NULL,
  `word` int NOT NULL,
  `reason` varchar(300) NOT NULL DEFAULT '',
  `operate` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'System',
  `date` datetime NOT NULL,
  `newWord` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Procedure structure for update_expire_time
-- ----------------------------
DROP PROCEDURE IF EXISTS `update_expire_time`;
delimiter ;;
CREATE PROCEDURE `update_expire_time`(IN id VARCHAR(64))
BEGIN
  UPDATE userlogin 
  SET expireTime = DATE_ADD(CONCAT(UTC_DATE(), ' ', UTC_TIME()), INTERVAL 1 DAY)
  WHERE id = id;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table word-history
-- ----------------------------
DROP TRIGGER IF EXISTS `userdata_sync`;
delimiter ;;
CREATE TRIGGER `userdata_sync` AFTER INSERT ON `word-history` FOR EACH ROW BEGIN
    DECLARE username_exist INT;
    SELECT COUNT(*) INTO username_exist FROM `userdata` WHERE `username` = NEW.`target`;
    IF (username_exist > 0) THEN
        UPDATE `userdata` SET `word` = `word` + NEW.`word` WHERE `username` = NEW.`target`;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Username not found in userdata';
    END IF;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
