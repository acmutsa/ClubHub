import { Resend } from 'resend'; 
import EmailTemplate from '@/components/password-reset-template';

const resend = new Resend(process.env.RESEND_API_KEY);

interface passwordResetParams{ 
    user: {
        name: string;
        email: string;
    };
    url: string;

};

export async function sendPasswordResetEmail({ user ,url }: passwordResetParams){
    resend.emails.send({ // should we swap email providers you will replace this logic
        from: "accounts@utsa.club",
        to: user.email,
        subject: "Reset Your ClubHub Password",
        react: EmailTemplate({name: user.name, url: url}),
        replyTo:"accounts@utsa.club"
      });
}