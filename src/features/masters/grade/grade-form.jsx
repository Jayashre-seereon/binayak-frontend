import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GradeForm({
  open,
  setOpen,
  onSave,
  defaultValues,
  purities,
}) {
  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      name: "",
      purityId: "",
      percentage: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      const resolvedPurityId =
        defaultValues?.purityId ||
        defaultValues?.purity?.id ||
        defaultValues?.purity?.purityId ||
        "";

      reset({
        name: defaultValues?.name || "",
        purityId: resolvedPurityId ? String(resolvedPurityId) : "",
        percentage:
          defaultValues?.percentage !== undefined &&
          defaultValues?.percentage !== null
            ? String(defaultValues.percentage)
            : "",
        description: defaultValues?.description || "",
      });
    }
  }, [defaultValues, open, reset]);

  const submit = (data) => {
    onSave({
      ...data,
      purityId: data.purityId ? Number(data.purityId) : null,
      percentage:
        data.percentage === "" || data.percentage === null
          ? null
          : Number.parseFloat(data.percentage),
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Grade Master</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <label className="text-sm">Grade Name</label>
            <Input className="h-9" {...register("name")} />
          </div>

          <div>
            <label className="text-sm">Purity</label>
            <Controller
              name="purityId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Select Purity" />
                  </SelectTrigger>
                  <SelectContent>
                    {purities.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <label className="text-sm">Percentage</label>
            <Input type="number" className="h-9" {...register("percentage")} />
          </div>

          <div>
            <label className="text-sm">Description</label>
            <Textarea rows={3} {...register("description")} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
