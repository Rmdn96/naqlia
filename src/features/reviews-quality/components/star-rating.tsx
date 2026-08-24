export function StarRating({
  defaultValue,
  label,
  name,
  required = false,
}: {
  defaultValue?: number | null;
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-black">{label}</legend>
      <div className="flex flex-row-reverse justify-end gap-1" role="radiogroup">
        {[5, 4, 3, 2, 1].map((rating) => (
          <label className="cursor-pointer" key={rating}>
            <input
              className="peer sr-only"
              defaultChecked={defaultValue === rating}
              name={name}
              required={required}
              type="radio"
              value={rating}
            />
            <span
              aria-hidden="true"
              className="block text-3xl text-muted-foreground transition peer-checked:text-amber-500 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
            >
              ★
            </span>
            <span className="sr-only">{rating}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
