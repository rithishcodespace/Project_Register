CREATE TABLE guide_requests (
  `id` int `AUTO_INCREMENT`
  `from_team_id` VARCHAR(200) NOT NULL,
  `project_id` VARCHAR(200) NOT NULL,
  `to_guide_reg_num` VARCHAR(200) NOT NULL,
  `status` VARCHAR(200) DEFAULT 'interested',
  `reason` TEXT DEFAULT NULL,
 `project_name` VARCHAR(500) DEFAULT NULL,
 `team_semester` INT NOT NULL;
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
  `team_id` VARCHAR(200) NOT NULL
  `project_name` varchar(500) DEFAULT NULL,
  `cluster` varchar(100) DEFAULT NULL,
  `description` text,
  `outcome` text,
  `hard_soft` varchar(50) NOT NULL,
  `project_type` varchar(50) DEFAULT NULL,
  `student_reg_num` tl_reg_num VARCHAR(20) DEFAULT NULL
  `posted_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`project_id`),
  UNIQUE KEY `unique_project_name` (`project_name`)
);



CREATE TABLE team_requests (
  team_id varchar(20),
  name varchar(255) DEFAULT NULL,
  emailId varchar(255) DEFAULT NULL,
  reg_num varchar(255) DEFAULT NULL,
  dept varchar(255) DEFAULT NULL,
  from_reg_num varchar(255) NOT NULL,
  to_reg_num varchar(255) NOT NULL,
  status varchar(255) DEFAULT 'interested',
  reason TEXT DEFAULT NULL,
  team_conformed int DEFAULT '0',
  UNIQUE KEY unique_request (from_reg_num,to_reg_num),
  PRIMARY KEY (from_reg_num, to_reg_num)
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
  `reveiw_title`VARCHAR(100) NOT NULL,
  `start_time` TIME DEFAULT NULL,
  `venue` varchar(200) DEFAULT NULL,
  `attendance` VARCHAR(255) DEFAULT null,
  `marks` VARCHAR(20) DEFAULT NULL,
  `remarks` VARCHAR(5000) DEFAULT NULL,
  `team_id` VARCHAR(300) DEFAULT NULL,
  `expert_reg_num` varchar(100) not null,
  `guide_reg_num` VARCHAR(100) NOT NULL,
  `meeting_link` varchar(500) default null
  PRIMARY KEY (`review_id`)
) 

CREATE TABLE `sub_expert_requests` (
  `from_team_id` VARCHAR(200) NOT NULL,
  `project_id` VARCHAR(200) NOT NULL,
  `to_expert_reg_num` VARCHAR(200) NOT NULL,
  `status` VARCHAR(200) DEFAULT 'interested',
  `reason` TEXT DEFAULT NULL,
  `project_name` VARCHAR(500) DEFAULT NULL,
  `team_semester` INT NOT NULL,
  PRIMARY KEY (`from_team_id`, `project_id`, `to_expert_reg_num`),
  INDEX `idx_status` (`status`)
) 

CREATE TABLE `weekly_logs_deadlines` (
  `team_id` varchar(50) NOT NULL,
  `project_id` varchar(100) DEFAULT NULL,
  `week1` date DEFAULT NULL,
  `week2` date DEFAULT NULL,
  `week3` date DEFAULT NULL,
  `week4` date DEFAULT NULL,
  `week5` date DEFAULT NULL,
  `week6` date DEFAULT NULL,
  `week7` date DEFAULT NULL,
  `week8` date DEFAULT NULL,
  `week9` date DEFAULT NULL,
  `week10` date DEFAULT NULL,
  `week11` date DEFAULT NULL,
  `week12` date DEFAULT NULL,
  PRIMARY KEY (team_id, project_id);
  INDEX idx_team (team_id)
  INDEX idx_project (project_id);
) 

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `emailId` VARCHAR(200) NOT NULL,
  `password` VARCHAR(200) DEFAULT NULL,
  `role` VARCHAR(200) DEFAULT NULL,
  `reg_num` VARCHAR(200) NOT NULL UNIQUE,
  `name` VARCHAR(200) DEFAULT NULL,
  `dept` VARCHAR(200) DEFAULT NULL,
  `semester` INT DEFAULT NULL
  `company_name` VARCHAR(300) DEFAULT NULL,
  `company_contact` VARCHAR(50) DEFAULT NULL,
  `company_address` VARCHAR(200) DEFAULT NULL,
  `project_type` VARCHAR(200) DEFAULT NULL,
  `phone_number` VARCHAR(20) DEFAULT NULL,
  `available` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`emailId`)
)

CREATE TABLE timeline (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    team_id INT 
    cron_executed boolean default false,
    INDEX index_start_date (start_date),
    INDEX index_end_date (end_date),
    INDEX index_date_range (start_date, end_date)
);

CREATE TABLE weekly_logs_verification (
    team_id VARCHAR(100) NOT NULL,
    week_number INT NOT NULL CHECK (week_number BETWEEN 1 AND 12),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(100), -- e.g., guide's email or user ID
    verified_at DATETIME DEFAULT NULL,
    remarks TEXT,
    status varchar(50) text default null,
    reason text default null,

    PRIMARY KEY (team_id, week_number)
);

CREATE TABLE review_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  team_id VARCHAR(20),
  project_id VARCHAR(50) NOT NULL,
  project_name VARCHAR(100) NOT NULL,
  team_lead VARCHAR(50) NOT NULL,
  review_date DATE DEFAULT NULL,
  review_title VARCHAR(100) NOT NULL,
  start_time TIME DEFAULT NULL,
  guide_status VARCHAR (100) DEFAULT 'interested',
  expert_status VARCHAR(100) default 'interested'
  expert_reg_num varchar(100) NOT NULL,
  guide_reg_num VARCHAR(100) NOT NULL,
  column guide_reason text default null,
  column expert_reason text default null
  file text not null
  
  INDEX idx_team_id (team_id),
  INDEX idx_project_id (project_id),
  INDEX idx_review_date (review_date)
);

CREATE TABLE review_marks (
  review_no INT,
  review_date DATE NOT NULL,
  team_id INT,

  guide_literature_survey INT NOT NULL CHECK (guide_literature_survey BETWEEN 0 AND 5),
  expert_literature_survey INT NOT NULL CHECK (expert_literature_survey BETWEEN 0 AND 5),

  guide_aim INT NOT NULL CHECK (guide_aim BETWEEN 0 AND 5),
  expert_aim INT NOT NULL CHECK (expert_aim BETWEEN 0 AND 5),

  guide_scope INT NOT NULL CHECK (guide_scope BETWEEN 0 AND 5),
  expert_scope INT NOT NULL CHECK (expert_scope BETWEEN 0 AND 5),

  guide_need_for_study INT NOT NULL CHECK (guide_need_for_study BETWEEN 0 AND 5),
  expert_need_for_study INT NOT NULL CHECK (expert_need_for_study BETWEEN 0 AND 5),

  guide_proposed_methodology INT NOT NULL CHECK (guide_proposed_methodology BETWEEN 0 AND 10),
  expert_proposed_methodology INT NOT NULL CHECK (expert_proposed_methodology BETWEEN 0 AND 10),

  guide_work_plan INT NOT NULL CHECK (guide_work_plan BETWEEN 0 AND 5),
  expert_work_plan INT NOT NULL CHECK (expert_work_plan BETWEEN 0 AND 5),

  guide_oral_presentation INT NOT NULL CHECK (guide_oral_presentation BETWEEN 0 AND 5),
  expert_oral_presentation INT NOT NULL CHECK (expert_oral_presentation BETWEEN 0 AND 5),

  guide_viva_voce_and_ppt INT NOT NULL CHECK (guide_viva_voce_and_ppt BETWEEN 0 AND 5),
  expert_viva_voce_and_ppt INT NOT NULL CHECK (expert_viva_voce_and_ppt BETWEEN 0 AND 5),

  guide_contributions INT NOT NULL CHECK (guide_contributions BETWEEN 0 AND 5),
  expert_contributions INT NOT NULL CHECK (expert_contributions BETWEEN 0 AND 5),

  guide_remarks TEXT NOT NULL,
  expert_remarks TEXT NOT NULL,

  total_expert_marks INT NOT NULL CHECK (total_expert_marks BETWEEN 0 AND 50),
  total_guide_marks INT NOT NULL CHECK (total_guide_marks BETWEEN 0 AND 50),
  total_marks INT NOT NULL CHECK (total_marks BETWEEN 0 AND 100),

  PRIMARY KEY (review_no, team_id)
);


CREATE TABLE teams (
  team_id VARCHAR(20),
  reg_num VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci, -- must match users.reg_num
  is_leader BOOLEAN DEFAULT 0,
  project_id VARCHAR(250),
  guide_reg_num VARCHAR(500),
  sub_expert_reg_num VARCHAR(500),
  project_picked_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  guide_verified INT DEFAULT 0,
  week1_progress VARCHAR(200),
  week2_progress VARCHAR(200),
  week3_progress VARCHAR(200),
  week4_progress VARCHAR(200),
  week5_progress VARCHAR(200),
  week6_progress VARCHAR(200),
  week7_progress VARCHAR(200),
  week8_progress VARCHAR(200),
  week9_progress VARCHAR(200),
  week10_progress VARCHAR(200),
  week11_progress VARCHAR(200),
  week12_progress VARCHAR(200),

  PRIMARY KEY (team_id, reg_num),
  FOREIGN KEY (reg_num) REFERENCES users(reg_num)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE `mentor_requests` (
  `from_team_id` VARCHAR(200) NOT NULL,
  `project_id` VARCHAR(200) NOT NULL,
  `mentor_reg_num` VARCHAR(200) NOT NULL,
  `status` VARCHAR(200) DEFAULT 'interested',
  `reason` TEXT DEFAULT NULL,
  `project_name` VARCHAR(500) DEFAULT NULL,
  `team_semester` INT NOT NULL,
  PRIMARY KEY (`from_team_id`, `project_id`, `mentor_reg_num`),
  INDEX `idx_status` (`status`)
) 


CREATE TABLE mentors_mentees (
    mentee_name VARCHAR(100) NOT NULL,
    mentee_reg_num VARCHAR(100) NOT NULL,
    mentee_emailId VARCHAR(100) NOT NULL,
    mentee_sem INT NOT NULL,
    mentor_name VARCHAR(100) NOT NULL,
    mentor_reg_num VARCHAR(100),
    mentor_emailId VARCHAR(100),
    PRIMARY KEY (mentee_reg_num)
);

CREATE TABLE review_marks_team (
  review_no INT AUTO_INCREMENT,
  review_title VARCHAR(100) not null,
  review_date DATE NOT NULL,
  team_id INT NOT NULL,

  guide_literature_survey INT NOT NULL CHECK (guide_literature_survey BETWEEN 0 AND 5),
  expert_literature_survey INT NOT NULL CHECK (expert_literature_survey BETWEEN 0 AND 5),

  guide_aim INT NOT NULL CHECK (guide_aim BETWEEN 0 AND 5),
  expert_aim INT NOT NULL CHECK (expert_aim BETWEEN 0 AND 5),

  guide_scope INT NOT NULL CHECK (guide_scope BETWEEN 0 AND 5),
  expert_scope INT NOT NULL CHECK (expert_scope BETWEEN 0 AND 5),

  guide_need_for_study INT NOT NULL CHECK (guide_need_for_study BETWEEN 0 AND 5),
  expert_need_for_study INT NOT NULL CHECK (expert_need_for_study BETWEEN 0 AND 5),

  guide_proposed_methodology INT NOT NULL CHECK (guide_proposed_methodology BETWEEN 0 AND 10),
  expert_proposed_methodology INT NOT NULL CHECK (expert_proposed_methodology BETWEEN 0 AND 10),

  guide_work_plan INT NOT NULL CHECK (guide_work_plan BETWEEN 0 AND 5),
  expert_work_plan INT NOT NULL CHECK (expert_work_plan BETWEEN 0 AND 5),

  total_guide_marks INT NOT NULL CHECK (total_guide_marks BETWEEN 0 AND 50),
  total_expert_marks INT NOT NULL CHECK (total_expert_marks BETWEEN 0 AND 50),
  total_marks INT NOT NULL CHECK (total_marks BETWEEN 0 AND 100),

  guide_remarks text default null,
  expert_remarks text default null,

  guide_reg_num varchar(100) default null,
  expert_reg_num varchar(100) default null

  PRIMARY KEY (review_no, team_id)
);

CREATE TABLE review_marks_individual (
  review_no INT AUTO_INCREMENT,
  reivew_title varchar(100) not null,
  review_date DATE NOT NULL,
  team_id INT NOT NULL,
  student_reg_num VARCHAR(20) NOT NULL,

  guide_oral_presentation INT NOT NULL CHECK (guide_oral_presentation BETWEEN 0 AND 5),
  expert_oral_presentation INT NOT NULL CHECK (expert_oral_presentation BETWEEN 0 AND 5),

  guide_viva_voce_and_ppt INT NOT NULL CHECK (guide_viva_voce_and_ppt BETWEEN 0 AND 5),
  expert_viva_voce_and_ppt INT NOT NULL CHECK (expert_viva_voce_and_ppt BETWEEN 0 AND 5),

  guide_contributions INT NOT NULL CHECK (guide_contributions BETWEEN 0 AND 5),
  expert_contributions INT NOT NULL CHECK (expert_contributions BETWEEN 0 AND 5),

  total_expert_marks INT NOT NULL CHECK (total_expert_marks BETWEEN 0 AND 50),
  total_guide_marks INT NOT NULL CHECK (total_guide_marks BETWEEN 0 AND 50),
  total_marks INT NOT NULL CHECK (total_marks BETWEEN 0 AND 100),

  guide_remarks text default null,
  expert_remarks text default null,

  guide_reg_num varchar(100) default null,
  expert_reg_num varchar(100) default null


  PRIMARY KEY (review_no, student_reg_num)
);

CREATE TABLE optional_review_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  team_id VARCHAR(100) NOT NULL,
  project_id VARCHAR(100) NOT NULL,
  team_lead VARCHAR(100) NOT NULL,
  review_date DATE NOT NULL,
  start_time TIME NOT NULL,
  reason text not null,
  mentor_reg_num VARCHAR(100) NOT NULL,
  status VARCHAR(100) DEFAULT NULL,
  file text not null
);

CREATE TABLE challenge_review_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  team_id VARCHAR(100) NOT NULL,
  project_id VARCHAR(100) NOT NULL,
  team_lead VARCHAR(100) NOT NULL,
  review_date DATE NOT NULL,
  start_time TIME NOT NULL,
  reason text not null,
  temp_expert VARCHAR(100) NOT NULL,
  temp_guide VARCHAR(100) NOT NULL,
  status VARCHAR(100) DEFAULT NULL,
  file text not null
);

