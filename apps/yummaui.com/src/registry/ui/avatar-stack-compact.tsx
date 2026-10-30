import { IconDeviceLaptop, IconDeviceMobile, IconDeviceTablet } from "@tabler/icons-react";
import Avatar from "./avatar";

export default function AvatarStackCompact() {
  return (
    <div className="d:f ai:c p:px bg:raised bs-o:key bc:rim br:9999 bw:1">
      {devices.map((device, index) => (
        <Avatar
          key={device.name}
          size="sm"
          name={device.name}
          fallback={<device.icon className="w:4 h:4" />}
          className={index > 0 ? "ml:-2" : ""}
        />
      ))}
      <Avatar size="sm" fallback={`+${extraCount}`} className="ml:-2" />
    </div>
  );
}

const devices = [
  { name: "This laptop", icon: IconDeviceLaptop },
  { name: "Phone", icon: IconDeviceMobile },
  { name: "Tablet", icon: IconDeviceTablet },
];

const extraCount = 1;
