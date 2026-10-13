const packages = [
  {
    id: 1,
    name: "Goa Beach Escape",
    location: "Goa, India",
    duration: "4 Days / 3 Nights",
    people: "2 People",
    price: "₹14,999",
    description:
      "Relax on beautiful beaches, enjoy water activities and experience the nightlife of Goa.",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2",

    availableDates: [
      {
        id: 101,
        start: "2026-10-10",
        end: "2026-10-13",
        seats: 20
      },
      {
        id: 102,
        start: "2026-10-17",
        end: "2026-10-20",
        seats: 15
      },
      {
        id: 103,
        start: "2026-10-24",
        end: "2026-10-27",
        seats: 0
      }
    ]
  },

  {
    id: 2,
    name: "Kashmir Adventure",
    location: "Kashmir, India",
    duration: "6 Days / 5 Nights",
    people: "2 People",
    price: "₹24,999",
    description:
      "Explore the beautiful valleys, mountains and lakes of Kashmir.",
    image:
      "https://images.unsplash.com/photo-1566837497312-7be2d9b3b6f1",

    availableDates: [
      {
        id: 201,
        start: "2026-10-12",
        end: "2026-10-17",
        seats: 12
      },
      {
        id: 202,
        start: "2026-10-26",
        end: "2026-10-31",
        seats: 8
      }
    ]
  },

  {
    id: 3,
    name: "Kerala Explorer",
    location: "Kerala, India",
    duration: "5 Days / 4 Nights",
    people: "2 People",
    price: "₹18,999",
    description:
      "Discover Kerala's backwaters, greenery, beaches and beautiful local experiences.",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",

    availableDates: [
      {
        id: 301,
        start: "2026-10-15",
        end: "2026-10-19",
        seats: 16
      },
      {
        id: 302,
        start: "2026-10-29",
        end: "2026-11-02",
        seats: 10
      }
    ]
  },

  {
    id: 4,
    name: "Manali Mountain Trip",
    location: "Manali, India",
    duration: "5 Days / 4 Nights",
    people: "2 People",
    price: "₹19,999",
    description:
      "Enjoy the mountains, scenic views, adventure activities and peaceful surroundings of Manali.",
    image:
      "https://images.unsplash.com/photo-1548013146-72479768bada",

    availableDates: [
      {
        id: 401,
        start: "2026-10-18",
        end: "2026-10-22",
        seats: 14
      },
      {
        id: 402,
        start: "2026-11-01",
        end: "2026-11-05",
        seats: 6
      }
    ]
  }
];

export default packages;