export default function Paragraf({ children }) {
  return (
    <p
      className="
        text-justify
        indent-8
        leading-8
        text-[15px]
        md:text-base
        text-gray-800
      "
    >
      {children}
    </p>
  );
}
