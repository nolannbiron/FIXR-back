import sgMail from '@sendgrid/mail';

export const confirmAuthEmail = async (email?: string, password?: string) => {
    if (!process.env.SENDGRID_API_KEY) return;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log(email, password);
    const msg = {
        to: email, // Change to your recipient
        from: 'nolann@nolannbiron.com', // Change to your verified sender
        subject: '[FIXR] Your account has been created',
        html: `<strong>Welcome to fixr here is your password : ${password}</strong><br/><p>Click <a href="http://localhost:3000/login">here</a> to login</p>`,
    };
    await sgMail.send(msg).catch((error) => {
        console.error(error);
    });
};
