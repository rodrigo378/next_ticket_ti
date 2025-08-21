import { Drawer } from "antd";

interface Props {
  openAdministrativo: boolean;
  onCloseAdministrativo: () => void;
}

export default function DrawerAdministrativo({
  openAdministrativo,
  onCloseAdministrativo,
}: Props) {
  return (
    <Drawer
      title="Drawer"
      placement="right"
      width={500}
      onClose={onCloseAdministrativo}
      open={openAdministrativo}
    ></Drawer>
  );
}
