"use client";

import {
  IconChevronDown,
  IconDownload,
  IconFileTypePdf,
  IconFileZip,
  IconLinkPlus,
} from "@tabler/icons-react";
import Button from "./button";
import ButtonGroup from "./button-group";
import Menu from "./menu";

export default function ButtonGroupSplit({
  container,
}: {
  container?: HTMLElement | null;
}) {
  return (
    <ButtonGroup>
      <Button icon={<IconDownload className="w:4 h:4" />}>Download</Button>
      <Menu
        container={container}
        trigger={
          <Button icon={<IconChevronDown className="w:4 h:4" />} iconOnly>
            Download options
          </Button>
        }
        items={[
          {
            label: "Download as PDF",
            icon: <IconFileTypePdf className="w:4 h:4" />,
          },
          {
            label: "Download as ZIP",
            icon: <IconFileZip className="w:4 h:4" />,
          },
          { type: "separator" },
          { label: "Copy link", icon: <IconLinkPlus className="w:4 h:4" /> },
        ]}
      />
    </ButtonGroup>
  );
}
