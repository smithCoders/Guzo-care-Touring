const catchsync = require("./catchAsync");
const nodemailer=require("nodemailer");
const path=require("path"); 
const ejs=require("ejs");

const  sendEmail = catchsync(async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const { email, subject, template, data } = options;
    const templatePath = path.join(__dirname, `../emails/${template}`);
    const html = await ejs.renderFile(templatePath, data);

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject,
        html
    }

    await transporter.sendMail(mailOptions);
});
module.exports = sendEmail;