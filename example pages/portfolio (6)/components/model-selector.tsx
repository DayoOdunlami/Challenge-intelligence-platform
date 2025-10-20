"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const models = [
  {
    value: "gpt-4o",
    label: "GPT-4o",
    description: "Latest and most capable model with vision",
  },
  {
    value: "gpt-4o-mini",
    label: "GPT-4o Mini",
    description: "Faster and more cost-effective",
  },
  {
    value: "gpt-4-turbo",
    label: "GPT-4 Turbo",
    description: "Previous generation model",
  },
  {
    value: "gpt-3.5-turbo",
    label: "GPT-3.5 Turbo",
    description: "Fast and economical model",
  },
]

interface ModelSelectorProps {
  onModelChange?: (model: string) => void
}

export function ModelSelector({ onModelChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("gpt-4o")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? models.find((model) => model.value === value)?.label : "Select model..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {models.map((model) => (
                <CommandItem
                  key={model.value}
                  value={model.value}
                  onSelect={(currentValue) => {
                    const selectedValue = currentValue === value ? "" : currentValue
                    setValue(selectedValue || "gpt-4o")
                    if (onModelChange) onModelChange(selectedValue || "gpt-4o")
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === model.value ? "opacity-100" : "opacity-0")} />
                  <div>
                    <div>{model.label}</div>
                    <div className="text-xs text-gray-500">{model.description}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
