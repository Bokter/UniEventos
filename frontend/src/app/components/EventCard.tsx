import { Link } from "react-router";
import { format } from "date-fns";
import { Calendar, MapPin } from "lucide-react";
import { Event } from "../data/mockData";
import { CategoryBadge } from "./CategoryBadge";
import { Card, CardContent, CardFooter } from "./ui/card";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link to={`/event/${event.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200 rounded-lg h-full">
        <div className="aspect-video overflow-hidden">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="line-clamp-2 flex-1" style={{ fontWeight: 600 }}>
              {event.title}
            </h3>
            <CategoryBadge category={event.category} />
          </div>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">
                {format(event.dateStart, 'MMM d, yyyy • h:mm a')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{event.location.name}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
              {event.organizers[0].name.charAt(0)}
            </div>
            <span className="text-sm text-muted-foreground line-clamp-1">
              {event.organizers[0].name}
              {event.organizers.length > 1 && ` +${event.organizers.length - 1}`}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
