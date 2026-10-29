import { IconBell, IconHelpCircle, IconKey, IconSearch, IconSettings, IconUserX, IconWorld } from "@tabler/icons-react";
import Autocomplete, { type AutocompleteItem } from "./autocomplete";

export default function AutocompleteIconLeading() {
  return (
    <Autocomplete
      items={settings}
      label="Search settings"
      placeholder="Account, Privacy, & more"
      icon={<IconSearch className="w:4 h:4" />}
      iconPosition="leading"
      emptyMessage="No settings found."
    />
  );
}

const settings: AutocompleteItem[] = [
  { label: "Account Settings", icon: <IconSettings className="w:4 h:4" /> },
  { label: "Privacy & Security", icon: <IconKey className="w:4 h:4" /> },
  {
    label: "Notifications",
    icon: <IconBell className="w:4 h:4" />,
  },
  { label: "Language & Region", icon: <IconWorld className="w:4 h:4" /> },
  { label: "Blocked Accounts", icon: <IconUserX className="w:4 h:4" /> },
  { label: "Help Center", icon: <IconHelpCircle className="w:4 h:4" /> },
];
