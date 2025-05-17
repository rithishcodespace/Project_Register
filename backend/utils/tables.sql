CREATE TABLE guide_requests (
  `from_team_id` VARCHAR(200) NOT NULL,
  `project_id` VARCHAR(200) NOT NULL,
  `to_guide_reg_num` VARCHAR(200) NOT NULL,
  status VARCHAR(200) DEFAULT 'interested',
 `project_name` VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (`from_team_id, project_id, to_guide_reg_num`),
  INDEX `idx_status` (status)
) 

CREATE TABLE `project_files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `project_id` int NOT NULL,
  `outcome` varchar(255) DEFAULT NULL,
  `report` varchar(255) DEFAULT NULL,
  `ppt` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_team_id` (`team_id`),
  INDEX `idx_project_id` (`project_id`)
) 

CREATE TABLE `projects` (
  `project_id` varchar(50) NOT NULL,
  `project_name` varchar(500) DEFAULT NULL,
  `cluster` varchar(100) DEFAULT NULL,
  `description` text,
  `phase_1_requirements` text,
  `phase_1_deadline` int DEFAULT NULL,
  `phase_2_requirements` text,
  `phase_2_deadline` int DEFAULT NULL,
  `phase_3_requirements` text,
  `phase_3_deadline` int DEFAULT NULL,
  `phase_4_requirements` text,
  `phase_4_deadline` int DEFAULT NULL,
  `phase_5_requirements` text,
  `phase_5_deadline` int DEFAULT NULL,
  `status` varchar(100) DEFAULT 'available',
  `guide_reg_num` varchar(5000) DEFAULT NULL,
  `posted_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`project_id`),
  UNIQUE KEY `unique_project_name` (`project_name`),
  INDEX `idx_status` (status)
)

CREATE TABLE `team_requests` (
  `team_id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `emailId` varchar(255) DEFAULT NULL,
  `reg_num` varchar(255) DEFAULT NULL,
  `dept` varchar(255) DEFAULT NULL,
  `from_reg_num` varchar(255) DEFAULT NULL,
  `to_reg_num` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT 'interested',
  `team_conformed` int DEFAULT '0',
  `project_id` varchar(250) DEFAULT NULL,
  `guide_reg_num` varchar(500) DEFAULT NULL,
  `sub_expert_reg_num` varchar(500) DEFAULT NULL,
  `project_picked_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `phase1_progress` varchar(200) DEFAULT NULL,
  `phase1_contribution` decimal(5,2) DEFAULT NULL,
  `phase2_progress` varchar(200) DEFAULT NULL,
  `phase2_contribution` decimal(5,2) DEFAULT NULL,
  `phase3_progress` varchar(200) DEFAULT NULL,
  `phase3_contribution` decimal(5,2) DEFAULT NULL,
  `phase4_progress` varchar(200) DEFAULT NULL,
  `phase4_contribution` decimal(5,2) DEFAULT NULL,
  `phase5_progress` varchar(200) DEFAULT NULL,
  `phase5_contribution` decimal(5,2) DEFAULT NULL,
  `phase6_progress` varchar(200) DEFAULT NULL,
  `phase6_contribution` decimal(5,2) DEFAULT NULL,
  `phase7_progress` varchar(200) DEFAULT NULL,
  `phase7_contribution` decimal(5,2) DEFAULT NULL,
  `phase8_progress` varchar(200) DEFAULT NULL,
  `phase8_contribution` decimal(5,2) DEFAULT NULL,
  `phase9_progress` varchar(200) DEFAULT NULL,
  `phase9_contribution` decimal(5,2) DEFAULT NULL,
  `phase10_progress` varchar(200) DEFAULT NULL,
  `phase10_contribution` decimal(5,2) DEFAULT NULL,
  `phase11_progress` varchar(200) DEFAULT NULL,
  `phase11_contribution` decimal(5,2) DEFAULT NULL,
  `phase12_progress` varchar(200) DEFAULT NULL,
  `phase12_contribution` decimal(5,2) DEFAULT NULL,
  UNIQUE KEY `unique_request` (`from_reg_num`,`to_reg_num`),
  PRIMARY KEY (`team_id`)
)

CREATE TABLE `queries` (
  `query_id` int NOT NULL AUTO_INCREMENT,
  `team_id` varchar(200) DEFAULT NULL,
  `project_id` varchar(200) DEFAULT NULL,
  `project_name` varchar(200) DEFAULT NULL,
  `team_member` varchar(200) DEFAULT NULL,
  `query` text,
  `reply` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `guide_reg_num` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`query_id`),
  INDEX `team_id` (`team_id`),
  INDEX `project_id` (`project_id`)
) 

CREATE TABLE `scheduled_reviews` (
  `review_id` INT NOT NULL AUTO_INCREMENT,
  `project_id` VARCHAR(100) DEFAULT NULL,
  `project_name` VARCHAR(500) DEFAULT NULL,
  `team_lead` VARCHAR(300) DEFAULT NULL,
  `review_date` DATE DEFAULT NULL,
  `start_time` TIME DEFAULT NULL,
  `attendance` VARCHAR(255) DEFAULT 'absent',
  `marks` VARCHAR(20) DEFAULT NULL,
  `remarks` VARCHAR(5000) DEFAULT NULL,
  `team_id` VARCHAR(300) DEFAULT NULL,
  PRIMARY KEY (`review_id`)
) 

CREATE TABLE `sub_expert_requests` (
  `from_team_id` VARCHAR(200) NOT NULL,
  `project_id` VARCHAR(200) NOT NULL,
  `to_expert_reg_num` VARCHAR(200) NOT NULL,
  `status` VARCHAR(200) DEFAULT 'interested',
  `project_name` VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (`from_team_id`, `project_id`, `to_expert_reg_num`),
  INDEX `idx_status` (`status`)
) 

CREATE TABLE `weekly_logs_deadlines` (
  `team_id` varchar(50) NOT NULL,
  `project_id` varchar(100) DEFAULT NULL,
  `week_1` date DEFAULT NULL,
  `week_2` date DEFAULT NULL,
  `week_3` date DEFAULT NULL,
  `week_4` date DEFAULT NULL,
  `week_5` date DEFAULT NULL,
  `week_6` date DEFAULT NULL,
  `week_7` date DEFAULT NULL,
  `week_8` date DEFAULT NULL,
  `week_9` date DEFAULT NULL,
  `week_10` date DEFAULT NULL,
  `week_11` date DEFAULT NULL,
  `week_12` date DEFAULT NULL,
  PRIMARY KEY (`team_id`)
) 

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `emailId` VARCHAR(200) NOT NULL,
  `password` VARCHAR(200) DEFAULT NULL,
  `role` VARCHAR(200) DEFAULT NULL,
  `reg_num` VARCHAR(200) DEFAULT NULL,
  `name` VARCHAR(200) DEFAULT NULL,
  `dept` VARCHAR(200) DEFAULT NULL,
  `project_type` VARCHAR(200) DEFAULT NULL,
  `phone_number` VARCHAR(20) DEFAULT NULL,
  `available` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`emailId`)
)

