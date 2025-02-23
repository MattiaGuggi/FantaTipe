import { mailtrapClient, sender } from '../mailtrap/mailtrap.config.js';
import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "../mailtrap/emailTemplates.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{ email }];
    await mailtrapClient.send({
        from: sender,
        to: [{ email: 'mattiahag@gmail.com' }],
        subject: "Verify your email",
        html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
        category: "Email Verification",
    });
};

export const sendPasswordResetEmail = async (email, resetURL) => {
    const recipient = [{ email }];
    await mailtrapClient.send({
        from: sender,
        to: [{ email: 'mattiahag@gmail.com' }],
        subject: "Reset your password",
        html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetLink}", resetURL),
        category: "Password Reset",
    });
};

export const sendPasswordResetEmailSuccessfull = async (email) => {
    const recipient = [{ email }];
    await mailtrapClient.send({
        from: sender,
        to: [{ email: 'mattiahag@gmail.com' }],
        subject: "Password Reset Successful",
        html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        category: "Password Reset",
    });
};
