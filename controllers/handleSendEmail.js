import nodemailer from 'nodemailer';
export const handleSendEmail=(userEmail,link)=>{

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.CONFIG_EMAIL,
    pass: process.env.CONFIG_PASSWORD
  }
});

const mailOptions = {
  from: 'Reset Password @resetpassword.com <donotreply@resetpassword.com>',
  to: userEmail,
  subject: 'Reset Password',
  text: 'link',
  html: `<a href=${link}>Click here to reset password</a>`
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
	console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
}