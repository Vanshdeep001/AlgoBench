const validator = require("validator");

// req.body 

const validate = (data) => {

    const mandatoryField = ['firstName', "emailId", 'password'];

    const IsAllowed = mandatoryField.every((k) => Object.keys(data).includes(k));

    if (!IsAllowed)
        throw new Error("Some Field Missing");

    if (!validator.isEmail(data.emailId))
        throw new Error("Invalid Email");

    if (data.password.length < 8)
        throw new Error("Password must be at least 8 characters");

    if (!/[A-Z]/.test(data.password))
        throw new Error("Password must contain at least one uppercase letter");

    if (!/[a-z]/.test(data.password))
        throw new Error("Password must contain at least one lowercase letter");

    if (!/[0-9]/.test(data.password))
        throw new Error("Password must contain at least one number");

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(data.password))
        throw new Error("Password must contain at least one special character");

    // Sanitize firstName length
    if (data.firstName.length < 3 || data.firstName.length > 20)
        throw new Error("First name must be between 3-20 characters");
}

module.exports = validate;