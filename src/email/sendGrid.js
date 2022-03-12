const sgMail = require('@sendgrid/mail')

// send grid api key
const sendgridApiKey = process.env.SENDGRIDKEY;

sgMail.setApiKey(sendgridApiKey)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'diddirajesh27@gmail.com',
        subject: 'Thank you for joining in task app',
        text: `Hello ${name}, I would like to thank you for joining in task app. With this app you can add tasks and do update, delete,
        get the tasks using simple commands. Hope you enjoy our services and once again we are delighted to serve you.`
    })
}

const sendDeleteEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'diddirajesh27@gmail.com',
        subject: 'Successfully removed you from task app on your request',
        text: `Hello ${name}, We are saddened that you are stopped our services. Thank you for using our services. We hope you enjoyed our
        services.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendDeleteEmail
}