import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export function DropMenu({
                             options = [],
                             onSelect,
                         }: {
    options: string[];
    onSelect: (value: string) => void;
}) {
    return (
        <Dropdown.Root>
            <Dropdown.Trigger asChild>
                <button className="px-4 py-2 border rounded bg-white shadow-sm">Select Option</button>
            </Dropdown.Trigger>
            <Dropdown.Portal>
                <Dropdown.Content
                    sideOffset={5}
                    className="bg-white border rounded shadow-md p-2"
                >
                    {options.map((option) => (
                        <Dropdown.Item
                            key={option}
                            className="px-3 py-1 hover:bg-gray-100 rounded cursor-pointer"
                            onSelect={() => onSelect(option)}
                        >
                            {option}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Content>
            </Dropdown.Portal>
        </Dropdown.Root>
    );
}