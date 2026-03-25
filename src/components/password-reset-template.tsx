import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  Link,
} from "@react-email/components";

interface EmailTemplateProps {
  name: string;
  url: string;
}

export default function EmailTemplate({ name, url }: EmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>

      <Tailwind>
        <Body className="bg-gray-100 py-6">
          <Container className="bg-white border border-gray-200 p-8 rounded-md max-w-md mx-auto">

            {/* Greeting */}
            <Section className="mb-4">
              <Text className="text-base text-gray-800 font-bold">
                Hi {name},
              </Text>
            </Section>

            {/* Message */}
            <Section className="mb-6">
              <Text className="text-sm text-black leading-relaxed">
                We received a request to reset your password. If this was you,
                click the button below to set a new password.
              </Text>
            </Section>

            {/* Button */}
            <Section className="mb-6 text-center">
              <Button
                href={url}
                className="bg-blue-600 text-white text-sm font-medium px-5 py-3 rounded-md"
              >
                Reset Password
              </Button>
            </Section>

            {/* Fallback */}
            <Section className="mb-6">
              <Text className="text-xs text-gray-500">
                If the button doesn’t work, copy and paste this link into your browser:
              </Text>
              <Link href={url} className="text-blue-600 text-xs break-all">
                {url}
              </Link>
            </Section>

            {/* Footer */}
            <Section>
              <Text className="text-xs text-gray-500">
                If you didn’t request this, you can safely ignore this email.
              </Text>

              <Text className="text-xs text-gray-500 mt-4">
                — ClubHub Team
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}