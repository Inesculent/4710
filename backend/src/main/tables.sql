CREATE TABLE users(
    uid INT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),

);

CREATE TABLE admin(
    uid INT PRIMARY KEY,
    FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);

CREATE TABLE super_admin(
    uid INT PRIMARY KEY,
    FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);


CREATE TABLE addresses (
    address_id INT PRIMARY KEY AUTO_INCREMENT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
);

CREATE TABLE events(
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    description TEXT,
    start_date DATETIME,
    end_date DATETIME,
    address_id INT,
    FOREIGN KEY (address_id) REFERENCES addresses(address_id) ON DELETE CASCADE
);


CREATE TABLE comments(
    event_id INT,
    user_id INT,
    text TEXT,
    rating INT,
    timestamp DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
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

--This is for user access to an event
CREATE TABLE user_access(
    event_id INT,
    user_id INT,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(uid) ON DELETE CASCADE
);

CREATE TABLE rso(
    rso_id INT PRIMARY KEY AUTO_INCREMENT,
    rso_name VARCHAR(255),
    description TEXT,
    university VARCHAR(255),
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


--Rule Rso needs 5 people minimum

--SUBSTRING('taylor.finch@ucf.edu', LOCATE('@', 'taylor.finch@ucf.edu'))





-- Trigger for rso being active
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


