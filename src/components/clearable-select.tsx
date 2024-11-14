import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form";

interface ClearableSelectProps {
    value?: string
    onValueChange?: (value: string) => void
    placeholder: string
    options: { value: string; label: string }[]
  }
  
  export default function ClearableSelect({ value, onValueChange, placeholder, options }: ClearableSelectProps) {
    const [open, setOpen] = useState(false)
  
    return (
      <Select
        value={value}
        onValueChange={onValueChange}
        open={open}
        onOpenChange={setOpen}
      >
        <FormControl>
          <SelectTrigger className={value ? '' : 'text-muted-foreground'}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
          {value && (
            <Button
              className="w-full px-2"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onValueChange?.('')
                setOpen(false)
              }}
            >
              Очистить
            </Button>
          )}
        </SelectContent>
      </Select>
    )
  }