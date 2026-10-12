import { GalleryVerticalEnd } from "lucide-react";
import PasswordResetForm from "@/components/pwrd-rs";

export default function ForgotPasswordPage() {

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="absolute top-6 left-6 md:top-10 md:left-10 flex justify-center gap-2 md:justify-start">
                <a href="/" className="flex items-center gap-2 font-medium">
                    <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    UTSA Clubs
                </a>
            </div>
            <PasswordResetForm />
        </div>
    );
}