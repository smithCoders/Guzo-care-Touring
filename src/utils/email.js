const nodemailer = require("nodemailer");
const catchAsync = require("../utils/catchAsync");
const sendEmail = catchAsync(async (options) => {
  // step-1:- create transporter.
  const transport = nodemailer.createTransport({
    // host: process.env.HOST,
    // port: process.env.EMAIL_PORT,
    // auth: {
    //   user: process.env.USER,
    //   pass: process.env.PASSWORD,
    // },
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "8fa14d798f8f6a",
      pass: "8e13ce90db67be",
    },
  });
  //   2.define email options,
  const mailOPtions = {
    from: "Abbajifar Touring<hello@AbbajifarTour.io>",
    to: options.email,
    subject: options.subject,
    text: options.text,
  };
  // 3.snd the email.
  await transport.sendMail(mailOPtions);
});
module.exports = sendEmail;
