/* @name CreateUser */
INSERT INTO usersMs (username, password, role)
VALUES (:username!, :password!, :role!)
    RETURNING *;

/* @name ValidateUser */
SELECT * FROM usersMs
         WHERE username = :username!;

/* @name DeleteUser */
DELETE FROM usersMs
WHERE username = :username!
RETURNING id;
