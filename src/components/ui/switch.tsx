export default function Switch({
  checked,
  onChange,
}: Readonly<{
  checked: boolean;
  onChange: (checked: boolean) => void;
}>) {
  return (
    <div
      className={`cursor-pointer p-0.5 relative flex items-center rounded-full w-12 ${
        checked ? "bg-dark" : "bg-dark/40"
      } transition-all duration-300 ease-in-out`}
      onClick={() => {
        onChange(!checked);
      }}
    >
      <div
        className={`${
          checked ? "translate-x-6" : "translate-x-0"
        } w-5 h-5 bg-light dark:bg-dark rounded-full transition-all duration-300 ease-in-out`}
      />
    </div>
  );
}
