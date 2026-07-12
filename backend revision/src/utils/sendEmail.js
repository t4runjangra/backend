import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
    });

    return info;
};

export { sendEmail };