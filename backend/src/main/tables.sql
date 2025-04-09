CREATE TABLE users(
    uid INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255)
);


CREATE TABLE university(
    university_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    students INT,
    description TEXT
);

CREATE TABLE student(
    uid INT PRIMARY KEY AUTO_INCREMENT,
    university_id INT,
    FOREIGN KEY (university_id) REFERENCES university(university_id),
    FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);

CREATE TABLE admin(
    uid INT PRIMARY KEY,
    university_id INT,
    FOREIGN KEY (university_id) REFERENCES university(university_id),
    FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);

CREATE TABLE super_admin(
    uid INT PRIMARY KEY,
    FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);



CREATE TABLE locations (
    locID INT PRIMARY KEY AUTO_INCREMENT,
    longitude REAL,
    latitude REAL
);


CREATE TABLE events(
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    description TEXT,
    date DATE,
    start TIME,
    end TIME,
    locID INT,
    university_id INT,
    FOREIGN KEY (university_id) REFERENCES university(university_id),
    FOREIGN KEY (locID) REFERENCES locations(locID) ON DELETE CASCADE
);



CREATE TABLE comments(
    event_id INT,
    user_id INT,
    text TEXT,
    rating INT,
    timestamp DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    CHECK (rating >= 1 AND rating <= 5)
);

CREATE TABLE public_events(
    approved BOOLEAN,
    event_id INT PRIMARY KEY,
    owner_id INT,
    FOREIGN KEY (owner_id) REFERENCES users(uid) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

CREATE TABLE private_events(
    event_id INT PRIMARY KEY,
    owner_id INT,
    FOREIGN KEY (owner_id) REFERENCES users(uid) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);


CREATE TABLE user_access(
    event_id INT,
    user_id INT,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(uid) ON DELETE CASCADE
);

CREATE TABLE rso(
    rso_id INT PRIMARY KEY AUTO_INCREMENT,
    rso_name VARCHAR(255) UNIQUE,
    description TEXT,
    universityID INT,
    admin_email VARCHAR(255),
    email_domain VARCHAR(255),
    is_active BOOLEAN DEFAULT FALSE
);


CREATE TABLE rso_events(
    event_id INT PRIMARY KEY,
    rso_id INT NOT NULL,

    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (rso_id) REFERENCES rso(rso_id) ON DELETE CASCADE
);

CREATE TABLE user_rso(
    rso_id INT,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(uid),
    FOREIGN KEY (rso_id) REFERENCES rso(rso_id)
);



DELIMITER //

CREATE TRIGGER rso_checker_update
AFTER UPDATE ON user_rso
FOR EACH ROW
BEGIN
    DECLARE ed VARCHAR(255);
    DECLARE user_count INT;

    SELECT email_domain INTO ed
    FROM rso
    WHERE rso_id = NEW.rso_id;

    SELECT COUNT(*) INTO user_count
    FROM user_rso ur
    JOIN users u ON u.uid = ur.user_id
    WHERE ur.rso_id = NEW.rso_id AND u.email LIKE CONCAT('%', ed);

    IF user_count >= 5 THEN
        UPDATE rso SET is_active = TRUE WHERE rso_id = NEW.rso_id;
    ELSE
        UPDATE rso SET is_active = FALSE WHERE rso_id = NEW.rso_id;
    END IF;
END //

DELIMITER ;

DELIMITER //
CREATE TRIGGER rso_checker_add
AFTER INSERT ON user_rso
FOR EACH ROW
BEGIN
    DECLARE ed VARCHAR(255);
    DECLARE user_count INT;

    SELECT email_domain INTO ed
    FROM rso
    WHERE rso_id = NEW.rso_id;

    SELECT COUNT(*) INTO user_count
    FROM user_rso ur
    JOIN users u ON u.uid = ur.user_id
    WHERE ur.rso_id = NEW.rso_id AND u.email LIKE CONCAT('%', ed);

    IF user_count >= 5 THEN
        UPDATE rso SET is_active = TRUE WHERE rso_id = NEW.rso_id;
    ELSE
        UPDATE rso SET is_active = FALSE WHERE rso_id = NEW.rso_id;
    END IF;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER rso_checker_delete
AFTER DELETE ON user_rso
FOR EACH ROW
BEGIN
    DECLARE ed VARCHAR(255);
    DECLARE user_count INT;

    SELECT email_domain INTO ed
    FROM rso
    WHERE rso_id = OLD.rso_id;

    SELECT COUNT(*) INTO user_count
    FROM user_rso ur
    JOIN users u ON u.uid = ur.user_id
    WHERE ur.rso_id = OLD.rso_id AND u.email LIKE CONCAT('%', ed);

    IF user_count >= 5 THEN
        UPDATE rso SET is_active = TRUE WHERE rso_id = OLD.rso_id;
    ELSE
        UPDATE rso SET is_active = FALSE WHERE rso_id = OLD.rso_id;
    END IF;
END //
DELIMITER ;

DELIMITER $$

CREATE TRIGGER before_events_insert
    BEFORE INSERT ON events
    FOR EACH ROW
BEGIN
    IF EXISTS(
        SELECT 1
        FROM events e
        WHERE e.locID = NEW.locID
          AND e.date = NEW.date
          AND ( (NEW.start < e.end) AND (NEW.end > e.start) )
    )THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Overlapping event exists at this location and date.';
END IF;
END$$
DELIMITER ;

