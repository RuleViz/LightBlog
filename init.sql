/*
SQLyog Community v13.3.0 (64 bit)
MySQL - 8.0.29 : Database - blog
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
-- CREATE DATABASE /*!32312 IF NOT EXISTS*/`blog` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

-- USE `blog`;

/*Table structure for table `categories` */

DROP TABLE IF EXISTS `categories`;

CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `level` int NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `description` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_slug` (`slug`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_level` (`level`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `categories` */

insert  into `categories`(`id`,`name`,`slug`,`parent_id`,`level`,`sort_order`,`is_active`,`description`,`created_at`,`updated_at`) values 
(1,'文档分类测试1','test_1',NULL,1,0,0,'描述测试111','2025-09-15 11:12:15','2025-09-15 11:13:39'),
(2,'分类测试2','category_test2',NULL,1,0,1,'分类测试2','2025-09-15 11:59:54','2025-09-15 11:59:54');

/*Table structure for table `comments` */

DROP TABLE IF EXISTS `comments`;

CREATE TABLE `comments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL,
  `post_id` bigint NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `author_name` varchar(100) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `like_count` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`),
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `comments` */

/*Table structure for table `likes` */

DROP TABLE IF EXISTS `likes`;

CREATE TABLE `likes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `target_type` enum('POST','COMMENT') NOT NULL,
  `target_id` bigint NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ip_target` (`ip_address`,`target_type`,`target_id`),
  KEY `idx_target` (`target_type`,`target_id`),
  KEY `idx_ip_address` (`ip_address`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `likes` */

insert  into `likes`(`id`,`target_type`,`target_id`,`ip_address`,`user_agent`,`created_at`) values 
(2,'POST',2,'0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','2025-09-15 16:08:41'),
(4,'POST',10,'0:0:0:0:0:0:0:1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','2025-09-24 15:44:36');

/*Table structure for table `operation_logs` */

DROP TABLE IF EXISTS `operation_logs`;

CREATE TABLE `operation_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `operation_type` varchar(50) NOT NULL,
  `operation_desc` text,
  `resource_type` varchar(50) DEFAULT NULL,
  `resource_id` bigint DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `status` enum('SUCCESS','FAILURE') DEFAULT NULL,
  `error_message` text,
  `execution_time` bigint DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_operation_type` (`operation_type`),
  KEY `idx_resource` (`resource_type`,`resource_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `operation_logs` */

/*Table structure for table `post_tags` */

DROP TABLE IF EXISTS `post_tags`;

CREATE TABLE `post_tags` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `post_id` bigint NOT NULL,
  `tag_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_post_tag` (`post_id`,`tag_id`),
  KEY `idx_tag_id` (`tag_id`),
  CONSTRAINT `fk_post_tags_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`),
  CONSTRAINT `fk_post_tags_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `post_tags` */

insert  into `post_tags`(`id`,`post_id`,`tag_id`) values 
(18,2,1),
(17,2,3),
(11,3,1),
(20,7,1),
(19,8,1);

/*Table structure for table `posts` */

DROP TABLE IF EXISTS `posts`;

CREATE TABLE `posts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `excerpt` text,
  `content` longtext NOT NULL,
  `content_type` enum('MARKDOWN','HTML','RICH_TEXT') NOT NULL,
  `status` enum('DRAFT','PUBLISHED','ARCHIVED') NOT NULL,
  `visibility` enum('PUBLIC','PRIVATE','PASSWORD') NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `category_id` bigint DEFAULT NULL,
  `cover_image_url` varchar(500) DEFAULT NULL,
  `meta_title` varchar(200) DEFAULT NULL,
  `meta_description` text,
  `meta_keywords` varchar(500) DEFAULT NULL,
  `view_count` bigint DEFAULT '0',
  `like_count` bigint DEFAULT '0',
  `comment_count` bigint DEFAULT '0',
  `published_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_posts_slug` (`slug`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_visibility` (`visibility`),
  KEY `idx_published_at` (`published_at`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_deleted_at` (`deleted_at`),
  KEY `idx_status_visibility_deleted` (`status`,`visibility`,`deleted_at`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `posts` */

insert  into `posts`(`id`,`title`,`slug`,`excerpt`,`content`,`content_type`,`status`,`visibility`,`password`,`category_id`,`cover_image_url`,`meta_title`,`meta_description`,`meta_keywords`,`view_count`,`like_count`,`comment_count`,`published_at`,`deleted_at`,`created_at`,`updated_at`) values 
(2,'测试1','test_1','测试2','# 1.昨天下午我去超市买了苹果，打算晚上吃。但妈妈说家里还有橘子，让我先别买，结果我结账后把苹果忘在收银台的袋子里了。\n\n##2.我从图书馆借的那本小说特别好看，讲的是一个女孩在森林里遇见一只会说话的兔子，后来他们一起寻找宝藏的故事。我昨天才把它看完。\n\n# 3.早上起床后我先刷了牙，然后煮鸡蛋，发现牛奶没了就下楼去买。等我回来时，面包已经凉了，我也不想吃了。\n\n## 4.学校组织的春游原定周六进行，但因下雨改到了下周日。同学们都很期待，打算带零食和相机去公园玩。\n\n# 5.姐姐教我用彩纸折小船：要先把纸对折再展开压出痕迹，然后把两边折成三角形。可我总是记不住这些步骤。','MARKDOWN','PUBLISHED','PUBLIC',NULL,1,NULL,NULL,NULL,NULL,65,1,0,'2025-09-15 11:49:26',NULL,'2025-09-15 11:49:26','2025-09-21 18:53:09'),
(3,'测试2','test_post_2',NULL,'没有内容只是用来测试111','MARKDOWN','PUBLISHED','PUBLIC','111',1,'',NULL,NULL,NULL,11,0,0,'2025-09-15 16:11:54',NULL,'2025-09-15 12:00:39','2025-09-15 16:13:30'),
(7,'测试4','test_post_4',NULL,'没有内容只是用来测试111','MARKDOWN','PUBLISHED','PASSWORD','123',1,'',NULL,NULL,NULL,13,0,0,'2025-09-15 15:25:12',NULL,'2025-09-15 15:25:12','2025-09-22 16:43:22'),
(8,'测试3','post_test3',NULL,'测试3\n# 测试3\n### 测试3\n## 测试3','MARKDOWN','PUBLISHED','PASSWORD','123',2,NULL,NULL,NULL,NULL,8,0,0,'2025-09-15 16:01:43',NULL,'2025-09-15 16:01:43','2025-09-22 16:43:01'),
(9,'11','11',NULL,'11','MARKDOWN','DRAFT','PUBLIC',NULL,NULL,NULL,NULL,NULL,NULL,3,0,0,NULL,'2025-09-21 16:55:44','2025-09-15 16:57:43','2025-09-21 16:55:44'),
(10,'dawdaw','test_security',NULL,'dasda','MARKDOWN','DRAFT','PASSWORD','123',NULL,NULL,NULL,NULL,NULL,18,1,0,'2025-09-21 19:47:42',NULL,'2025-09-21 19:47:42','2025-09-24 15:52:43'),
(11,'1111','11111',NULL,'1111','MARKDOWN','ARCHIVED','PUBLIC',NULL,NULL,NULL,NULL,NULL,NULL,2,0,0,NULL,NULL,'2025-09-24 16:03:23','2025-09-24 16:03:46');

/*Table structure for table `system_configs` */

DROP TABLE IF EXISTS `system_configs`;

CREATE TABLE `system_configs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) NOT NULL,
  `config_value` text,
  `config_type` enum('STRING','NUMBER','BOOLEAN','JSON') NOT NULL,
  `description` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_system_configs_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `system_configs` */

/*Table structure for table `tags` */

DROP TABLE IF EXISTS `tags`;

CREATE TABLE `tags` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `color` varchar(7) DEFAULT NULL,
  `post_count` int DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tags_name` (`name`),
  UNIQUE KEY `uk_tags_slug` (`slug`),
  KEY `idx_post_count` (`post_count`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `tags` */

insert  into `tags`(`id`,`name`,`slug`,`color`,`post_count`,`created_at`,`updated_at`) values 
(1,'测试1','test_1','#0f760a',4,'2025-09-15 11:55:35','2025-09-24 15:46:20'),
(3,'测试2','tag_test_2','#ea7c7c',1,'2025-09-15 16:02:20','2025-09-15 16:10:14');

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `nickname` varchar(50) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `users` */

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
