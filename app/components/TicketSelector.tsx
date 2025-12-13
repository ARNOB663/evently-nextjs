'use client';

import { useState } from 'react';
import { Minus, Plus, Ticket, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface TicketType {
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description?: string;
  earlyBirdDeadline?: string;
}

interface TicketSelection {
  ticketType: string;
  quantity: number;
  price: number;
}

interface TicketSelectorProps {
  ticketTypes: TicketType[];
  onSelectionChange: (selections: TicketSelection[]) => void;
  maxTotal?: number;
}

export function TicketSelector({ ticketTypes, onSelectionChange, maxTotal = 10 }: TicketSelectorProps) {
  const [selections, setSelections] = useState<Record<string, number>>({});

  const getAvailable = (ticket: TicketType) => ticket.quantity - ticket.sold;

  const getTotalSelected = () => Object.values(selections).reduce((sum, qty) => sum + qty, 0);

  const isEarlyBird = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) > new Date();
  };

  const updateQuantity = (ticketName: string, delta: number) => {
    const ticket = ticketTypes.find((t) => t.name === ticketName);
    if (!ticket) return;

    const currentQty = selections[ticketName] || 0;
    const newQty = Math.max(0, currentQty + delta);
    const available = getAvailable(ticket);
    const totalOthers = getTotalSelected() - currentQty;

    // Check constraints
    if (newQty > available) return;
    if (totalOthers + newQty > maxTotal) return;

    const newSelections = { ...selections, [ticketName]: newQty };
    
    // Remove if zero
    if (newQty === 0) {
      delete newSelections[ticketName];
    }

    setSelections(newSelections);

    // Convert to array format for parent
    const selectionArray: TicketSelection[] = Object.entries(newSelections)
      .filter(([_, qty]) => qty > 0)
      .map(([name, quantity]) => {
        const t = ticketTypes.find((tt) => tt.name === name)!;
        return { ticketType: name, quantity, price: t.price };
      });

    onSelectionChange(selectionArray);
  };

  const getTotalPrice = () => {
    return Object.entries(selections).reduce((total, [name, qty]) => {
      const ticket = ticketTypes.find((t) => t.name === name);
      return total + (ticket?.price || 0) * qty;
    }, 0);
  };

  if (!ticketTypes || ticketTypes.length === 0) {
    return (
      <Card className="p-4 text-center text-gray-500">
        <Ticket className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>No ticket types available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {ticketTypes.map((ticket) => {
        const available = getAvailable(ticket);
        const selected = selections[ticket.name] || 0;
        const isSoldOut = available <= 0;
        const earlyBird = isEarlyBird(ticket.earlyBirdDeadline);

        return (
          <Card
            key={ticket.name}
            className={`p-4 transition-all ${
              selected > 0 ? 'border-teal-500 bg-teal-50/50' : ''
            } ${isSoldOut ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{ticket.name}</h4>
                  {earlyBird && (
                    <Badge className="bg-orange-100 text-orange-800 text-xs">Early Bird</Badge>
                  )}
                  {isSoldOut && (
                    <Badge className="bg-red-100 text-red-800 text-xs">Sold Out</Badge>
                  )}
                </div>
                {ticket.description && (
                  <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-bold text-lg text-gray-900">
                    {ticket.price === 0 ? 'Free' : `$${ticket.price.toFixed(2)}`}
                  </span>
                  <span className="text-gray-500">
                    {available} available
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(ticket.name, -1)}
                  disabled={selected === 0 || isSoldOut}
                  className="w-8 h-8 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-semibold text-gray-900">{selected}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(ticket.name, 1)}
                  disabled={isSoldOut || selected >= available || getTotalSelected() >= maxTotal}
                  className="w-8 h-8 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}

      {/* Total Summary */}
      {getTotalSelected() > 0 && (
        <Card className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {getTotalSelected()} ticket{getTotalSelected() > 1 ? 's' : ''} selected
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {getTotalPrice() === 0 ? 'Free' : `$${getTotalPrice().toFixed(2)}`}
              </p>
            </div>
            <Ticket className="w-8 h-8 text-teal-500" />
          </div>
        </Card>
      )}

      {/* Info */}
      <div className="flex items-start gap-2 text-xs text-gray-500">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>Maximum {maxTotal} tickets per order. Tickets are non-refundable.</p>
      </div>
    </div>
  );
}
