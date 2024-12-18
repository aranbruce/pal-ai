import ExampleMessageCard, {
  ExampleMessageCardProps,
} from "./example-message-card";

// make ExampleMessageCardGroupProps an array

export default function ExampleMessageCardGroup({
  exampleMessages,
}: {
  exampleMessages: ExampleMessageCardProps[];
}) {
  return (
    <div className="grid w-full grid-cols-2 gap-2 px-4 sm:px-0 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => {
        const example = exampleMessages[index];
        return (
          <ExampleMessageCard
            key={index}
            index={index}
            heading={example ? example.heading : undefined}
            subheading={example ? example.subheading : undefined}
            modelVariable={example ? example.modelVariable : undefined}
          />
        );
      })}
    </div>
  );
}
