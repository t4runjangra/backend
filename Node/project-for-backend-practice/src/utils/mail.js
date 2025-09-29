import Mailgen from "mailgen"; // mailgen is a  node.js package that generate clean responsive HTML emails 
import nodemailer from "nodemailer"; // used to deliver (send) emails.

// creates a send email async function here using the mailgen and nodemailer 
const sendEmail = async (options) => {
    // this is a mailgenerator object which is like a default how your mail theme will going to be 
    const mailGenerator = new Mailgen(
        {
            theme: "default",
            product: {
                name: "Task Manager",
                link: "https://taskmanagelink.com"
            }
        }
    )
    const emailTextual = mailGenerator.generatePlainText(options.mailgenContent) // this will generate the mail in textual format in case the client does not support the html
    const emailHtml = mailGenerator.generate(options.mailgenContent) // this will generate the HTML mail

    // here we have a transporter method(object) of the nodemailer used to send mail 
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST, // this refers to the address of the SMTP(simple mail transfer protocol) server 
        port: process.env.MAILTRAP_SMTP_PORT, //port number of SMTP
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        },
    });
    // By setting this up nodemailer knows -> which server to use , which port to connect , which credentials to use to log in and send emails 


    // store info of your mail like who is sending and other credentials 
    const mail = {
        from: "mail.tarunjangra1903@gmail.com",
        to: options.mail,
        text: emailTextual,
        html: emailHtml,
    }
    // using a try catch while sending because the nodemailer or the mailtrao can through error 
    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.error("An Error occured with the mailtrap")
        console.error("error: ", error)

    }
}

 
// here we have a emailVerificationMailgenContent named function which recieves the username and verificationUrl and returns an object which is a boilerplate that will send to the user to his mail after he register successfully 

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
                } // this button will verify the user if he is legit or not 
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}

// will used for forgot password 
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


// Exporting all functions for reuse in other files/modules
export {
    emailVerificationMailgenContent,
    sendEmail,
    forgotPasswordMailgenContent
}