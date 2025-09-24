import Mailgen from "mailgen";

const emailVerificationMailgenContent = (username, verficationUrl) => {
    return {
        body: {
            name: username,
            intro: 'Welcome to our App! We\'re very excited to have you on board.',
            action: {
                instructions: 'To get started with Us, please click here:',
                button: {
                    color: '#22BC66',
                    text: 'Confirm your account',
                    link: verficationUrl
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: 'we just got a request to reset Password',
            action: {
                instructions: 'To reset your password, please click here:',
                button: {
                    color: '#ff1b1b',
                    text: 'Reset Password',
                    link: passwordResetUrl
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}