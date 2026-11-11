'use client'
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


import { Input } from "@/components/ui/input";
import { createUserProfileValues } from "@/lib/validators/user-profile";
import { createResumeUploadSchema } from "@/lib/validators/file";

type ResumeStepProps = React.ComponentProps<"form"> & {
    form: UseFormReturn<createUserProfileValues>;
    resumeError: string | null;
    setResumeError: React.Dispatch<React.SetStateAction<string | null>>;
    onBack: () => void;
    onNext: () => void;
    headingRef: React.RefObject<HTMLHeadingElement | null>;
};

export default function ResumeStep({
    form,
    onBack,
    onNext,
    resumeError,
    setResumeError,
}: ResumeStepProps) {

    return (
        <Card className='w-full max-w-md'>
            <CardHeader>
                <CardTitle className='font-semibold'>Feel free to upload your resume.</CardTitle>
                <CardDescription>This is an optional step and is not necessary to complete registration.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='w-full space-y-2'>
                    <Label htmlFor='studio-input' className='gap-1'>
                        Upload File
                    </Label>
                        <Input
                            id='studio-input'
                            type='file'
                            className='text-muted-foreground file:border-input file:text-foreground p-0 pr-3 italic file:mr-3 file:h-full file:border-0 file:border-r file:border-solid file:bg-transparent file:px-3 file:text-sm file:font-medium file:not-italic'
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) {
                                    setResumeError(null);
                                    return;
                                }
                                const result = createResumeUploadSchema.safeParse({
                                    fileName: file.name,
                                    mimeType: file.type,
                                    sizeBytes: file.size,
                                });
                                setResumeError(
                                    result.success
                                        ? null
                                        : result.error.issues[0]?.message ?? "Invalid resume file.",
                                );
                            }
                        }
                    />
                    <p className='text-muted-foreground text-xs'>You can upload a file here.</p>
                    {resumeError && (
                        <p role="alert" className="text-sm text-destructive">
                            {resumeError}
                        </p>
                    )}
                </div>
            </CardContent>
            <CardContent className='flex justify-end gap-2 max-sm:justify-center'>
                <Button className='max-sm:flex-1' variant='outline' type='button' onClick={onBack}>
                    Back
                </Button>
                <Button className='max-sm:flex-1' type='submit'>
                    Next
                </Button>
            </CardContent>
        </Card>
    )
}