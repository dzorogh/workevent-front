import { Api } from "@/lib/api";
import { Metadata } from "next";
import H1 from "@/components/ui/h1";
import NewEventForm from "./new-event-form";

export const metadata: Metadata = {
  title: "Добавить событие",
  description: "Предложите деловое мероприятие для каталога Workevent.",
};

export default async function NewEventPage() {
  const industriesResponse = await Api.GET('/v1/industries');
  const industries = industriesResponse.data?.data ?? [];

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-3">
        <H1 className="m-0">Добавить событие</H1>
        <p className="text-muted-foreground-dark">
          Заявка уйдёт в каталог. Свяжемся, чтобы уточнить детали и опубликовать карточку.
        </p>
      </div>
      <NewEventForm industries={industries} />
    </div>
  );
}
