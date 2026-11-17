import {
  CalendarDaysIcon,
  ClipboardCheckIcon,
  SearchIcon,
  TicketIcon,
  UserCogIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

export type AudienceId = "students" | "organizations"

export type Audience = {
  id: AudienceId
  label: string
  summary: string
  features: { title: string; body: string; icon: LucideIcon }[]
}

export const audiences: Audience[] = [
  {
    id: "students",
    label: "Students",
    summary: "Find your people, know what's happening, and get credit for showing up.",
    features: [
      {
        title: "Find and join organizations",
        body: "Browse every club on campus by category or search by name. Read what each one is about, see who runs it, and join in a couple of taps.",
        icon: SearchIcon,
      },
      {
        title: "See every upcoming event",
        body: "One shared calendar for all clubs, so you never have to dig through group chats and flyers to find out what's on this week.",
        icon: CalendarDaysIcon,
      },
      {
        title: "Check in with your Event Pass",
        body: "Show your personal pass at the door and you're counted. Your attendance builds into a record of the things you've actually shown up to.",
        icon: TicketIcon,
      },
    ],
  },
  {
    id: "organizations",
    label: "Organizations",
    summary: "Run your club from one place instead of spreadsheets and sign-in sheets.",
    features: [
      {
        title: "Manage members and events",
        body: "Keep your roster current, create events with the details students need, and see who is coming before you walk into the room.",
        icon: UsersIcon,
      },
      {
        title: "Customize member roles",
        body: "Set up officers, committee leads and regular members, and decide what each role is allowed to do, so leadership can change without starting over.",
        icon: UserCogIcon,
      },
      {
        title: "Track attendance and membership",
        body: "Check-ins are recorded automatically, so you can see who is active, who has drifted away, and keep membership status accurate all semester.",
        icon: ClipboardCheckIcon,
      },
    ],
  },
]
