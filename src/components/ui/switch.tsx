export default function Switch({
  checked,
  disabled,
  onChange,
}: Readonly<{
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}>) {
  return (
    <div
      className={`cursor-pointer py-0.5 px-0.5 relative flex items-center rounded-full w-10 ${
        checked ? "bg-dark dark:bg-light" : "bg-dark/40 dark:bg-light/40"
      } ${
        disabled && (checked ? "opacity-15 dark:opacity-10" : "opacity-30")
      } transition-all duration-300 ease-in-out`}
      onClick={() => {
        if (!disabled) {
          onChange(!checked);
        }
      }}
    >
      <div
        className={`${
          checked ? "translate-x-5" : "translate-x-0"
        } w-4 h-4 bg-light dark:bg-dark rounded-full transition-all duration-300 ease-in-out`}
      />
    </div>
  );
}
