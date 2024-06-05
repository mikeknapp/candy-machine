import {
  Kbd,
  Modal,
  ModalBody,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "flowbite-react";
import React, { useState } from "react";
import { useApp } from "../../hooks/useApp";
import { useShortcut } from "../../hooks/useShortcut";

export function ShortcutsModal() {
  const app = useApp();
  const [show, setShow] = useState(false);

  useShortcut({
    description: "Shortcuts Guide",
    keys: "?",
    onKeyDown: () => setShow(true),
    deps: [],
  });

  return (
    <Modal show={show} dismissible onClose={() => setShow(false)}>
      <ModalHeader>Keyboard Shortcuts</ModalHeader>
      <ModalBody>
        <Table>
          <TableBody>
            {app.shortcuts.map((shortcut, i) => (
              <TableRow key={`shortcut-${i}`}>
                <TableCell>{shortcut.description}</TableCell>
                <TableCell className="flex gap-2">
                  {shortcut.keys.map((key, j) => (
                    <Kbd key={`shortcut-${i}-${j}`}>{key}</Kbd>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ModalBody>
    </Modal>
  );
}
