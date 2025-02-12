export default function Switch({
  checked,
  onChange,
}: Readonly<{
  checked: boolean;
  onChange: (checked: boolean) => void;
}>) {
  return (
    <div
      className={`cursor-pointer py-0.5 px-0.5 relative flex items-center rounded-full w-10 ${
        checked ? "bg-dark" : "bg-dark/40"
      } transition-all duration-300 ease-in-out`}
      onClick={() => {
        onChange(!checked);
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
