message = {
    from: "from-example@email.com",
    to: "to-example@email.com",
    subject: "Subject",
    text: "Hello SMTP Email"
}
var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "9e55cf710de2fe",
      pass: "01d0229603f1cb"
    }
  
  });
  
transporter.sendMail(message, (err, info) =>{
    if (err) {
      console.log(err)
    } else {
      console.log(info);
    }
}