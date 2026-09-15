const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Started');

  // 1. Seed NewsPosts
  const newsPostsData = [
    {
      title: "ECB Interest Rate Update: What it means for Irish Mortgages",
      body: "The European Central Bank has announced its latest rate changes. We break down what this means for tracker mortgages, fixed-rate renewals, and First-Time Buyers trying to get approval in principle from Irish banks.",
      authorName: "Aoife O'Connor",
      imageUrl: "https://picsum.photos/seed/news1/800/400",
      category: "Market Update",
      tags: ["Mortgages", "ECB", "First Time Buyers"],
      section: "Featured News",
      status: "published",
      publishedAt: new Date(),
    },
    {
      title: "Latest Housing Report: Supply in Dublin Commuter Belt Increases",
      body: "Recent reports from Daft.ie and MyHome.ie indicate a slight increase in housing stock across Kildare, Meath, and Wicklow, providing some relief for house hunters working in Dublin.",
      authorName: "Sean Murphy",
      imageUrl: "https://picsum.photos/seed/news2/800/400",
      category: "Housing Supply",
      tags: ["Dublin", "Commuter Belt", "Market Report"],
      section: "Featured News",
      status: "published",
      publishedAt: new Date(),
    },
    {
      title: "Help to Buy Scheme Extended: A Guide for First-Time Buyers",
      body: "The Government has extended the Help to Buy (HTB) scheme in the latest Budget. Learn how you can claim back up to €30,000 on your income tax to put towards your deposit on a new build home.",
      authorName: "Ciara Kelly",
      imageUrl: "https://picsum.photos/seed/news3/800/400",
      category: "Government Schemes",
      tags: ["Help to Buy", "New Builds", "Taxes"],
      section: "Advice",
      status: "published",
      publishedAt: new Date(),
    },
    {
      title: "New A-Rated Development Launching in Naas, Co. Kildare",
      body: "We are thrilled to announce phase 1 of 'The Paddocks' in Naas. These A2-rated, 3 and 4 bedroom semi-detached homes qualify for both the Help to Buy and the First Home Scheme.",
      authorName: "Liam Gallagher",
      imageUrl: "https://picsum.photos/seed/news4/800/400",
      category: "New Developments",
      tags: ["Kildare", "New Homes", "A-Rated"],
      section: "Promotions",
      status: "published",
      publishedAt: new Date(),
    },
    {
      title: "Understanding Building Energy Ratings (BER) in Ireland",
      body: "What is the difference between an A2 and a C1 BER rating? We explain how energy ratings impact your heating bills, carbon footprint, and eligibility for Green Mortgage rates.",
      authorName: "Niamh Walsh",
      imageUrl: "https://picsum.photos/seed/news5/800/400",
      category: "Advice",
      tags: ["BER", "Energy Efficiency", "Green Mortgages"],
      section: "Advice",
      status: "published",
      publishedAt: new Date(),
    },
    {
      title: "Navigating the Vacant Property Refurbishment Grant",
      body: "Thinking of buying a 'doer-upper'? You might be eligible for up to €50,000 (or €70,000 for derelict properties) under the Croí Cónaithe scheme. Here is how to apply.",
      authorName: "Eoin Byrne",
      imageUrl: "https://picsum.photos/seed/news6/800/400",
      category: "Government Schemes",
      tags: ["Renovation", "Grants", "Derelict"],
      section: "Advice",
      status: "published",
      publishedAt: new Date(),
    },
    {
      title: "Rent Pressure Zones (RPZ): 2026 Guidelines for Landlords",
      body: "A complete guide to the latest Residential Tenancies Board (RTB) regulations regarding rent caps and eviction notices for properties located inside Rent Pressure Zones.",
      authorName: "Fiona McCarthy",
      imageUrl: "https://picsum.photos/seed/news7/800/400",
      category: "Lettings",
      tags: ["Landlords", "RTB", "RPZ"],
      section: "Lettings",
      status: "draft",
      publishedAt: null,
    },
    {
      title: "Top Tips for Bidding at an Irish Property Auction",
      body: "Online property auctions are becoming increasingly popular via platforms like BidX1. Read our top tips on arranging finances and doing your due diligence before the virtual hammer falls.",
      authorName: "Conor O'Brien",
      imageUrl: "https://picsum.photos/seed/news8/800/400",
      category: "Buying",
      tags: ["Auctions", "Bidding"],
      section: "Advice",
      status: "published",
      publishedAt: new Date(),
    },
    {
      title: "Market Review: Munster's Growing Demand for Detached Homes",
      body: "Post-pandemic remote working trends have caused a surge in demand for spacious, detached properties across Cork, Kerry, and Waterford. We look at the latest pricing trends.",
      authorName: "Sinead O'Sullivan",
      imageUrl: "https://picsum.photos/seed/news9/800/400",
      category: "Market Update",
      tags: ["Munster", "Cork", "Detached Homes"],
      section: "Featured News",
      status: "published",
      publishedAt: new Date(),
    },
    {
      title: "Preparing Your Home for Sale this Spring",
      body: "Spring is traditionally the busiest time in the Irish property market. Discover low-cost ways to boost your property's curb appeal and secure the best possible valuation from your estate agent.",
      authorName: "Declan Lynch",
      imageUrl: "https://picsum.photos/seed/news10/800/400",
      category: "Selling",
      tags: ["Home Improvement", "Valuations", "Spring Market"],
      section: "Advice",
      status: "published",
      publishedAt: new Date(),
    }
  ];

  for (const post of newsPostsData) {
    await prisma.newsPost.create({ data: post });
  }
  console.log('NewsPosts created.');

  // 2. Seed PageContent
  const pageContentData = [
    { title: "Home Page Hero", sectionId: "hero", sectionTitle: "Find Your Dream Home in Ireland", sectionSubtitle: "From city apartments to country estates", sectionBody: "Search thousands of properties for sale and to rent across Dublin, Cork, Galway and nationwide.", imageUrl: "https://picsum.photos/seed/hero/1200/600" },
    { title: "About Us", sectionId: "about", sectionTitle: "Ireland's Trusted Estate Agents", sectionSubtitle: "Over 40 years of local expertise", sectionBody: "Fully licensed by the PSRA, our dedicated agents provide exceptional service and local market knowledge to ensure you get the best price for your property.", imageUrl: null },
    { title: "New Developments", sectionId: "new-homes", sectionTitle: "A-Rated New Builds", sectionSubtitle: "Eligible for Help to Buy", sectionBody: "Explore our stunning portfolio of energy-efficient new homes in sought-after commuter towns and city suburbs.", imageUrl: "https://picsum.photos/seed/newhomes/800/400" },
    { title: "Valuations", sectionId: "valuations", sectionTitle: "Free Property Valuations", sectionSubtitle: "Thinking of selling?", sectionBody: "Book a free, no-obligation market appraisal with our local property experts to find out how much your home is worth in today's market.", imageUrl: null },
    { title: "Lettings", sectionId: "lettings", sectionTitle: "Premium Lettings & Management", sectionSubtitle: "Hassle-free landlord services", sectionBody: "From tenant vetting and RTB registration to full property management, we take the stress out of letting your property.", imageUrl: "https://picsum.photos/seed/lettings/800/400" },
    { title: "Mortgages", sectionId: "mortgages", sectionTitle: "Mortgage Advice", sectionSubtitle: "Partnered with Ireland's top brokers", sectionBody: "Need help getting your finances in order? Speak to our partnered mortgage advisors about securing the best fixed or variable rates.", imageUrl: null },
    { title: "First Time Buyers", sectionId: "ftb", sectionTitle: "First-Time Buyer Guide", sectionSubtitle: "Taking the first step on the property ladder", sectionBody: "Download our comprehensive guide to navigating mortgage approval, bidding, conveyancing, and the Help to Buy scheme.", imageUrl: "https://picsum.photos/seed/ftb/800/400" },
    { title: "Commercial", sectionId: "commercial", sectionTitle: "Commercial Property", sectionSubtitle: "Retail, Office, and Industrial", sectionBody: "View our extensive listings of commercial units to let and for sale across major Irish business hubs.", imageUrl: null },
    { title: "Testimonials", sectionId: "testimonials", sectionTitle: "What Our Clients Say", sectionSubtitle: "5-Star Rated Service", sectionBody: "'The team made selling our house in Lucan completely stress-free. Highly recommended!' - Sarah & Mark", imageUrl: null },
    { title: "Contact Us", sectionId: "contact", sectionTitle: "Visit Our Branches", sectionSubtitle: "Dublin, Cork, and Galway", sectionBody: "Drop into one of our nationwide branches or call us today to speak with a licensed estate agent.", imageUrl: "https://picsum.photos/seed/contact/800/400" }
  ];

  for (const content of pageContentData) {
    await prisma.pageContent.create({ data: content });
  }
  console.log('PageContents created.');

  // 3. Seed HouseType (Realistic Irish Properties)
  const houseTypesData = [
    {
      name: "3-Bed Semi-Detached (Dublin Commuter)",
      berRating: "A2",
      style: "Semi-Detached",
      description: "A superb 3-bedroom semi-detached family home in a new development in Maynooth, Co. Kildare. Features an air-to-water heat pump and qualifies for the Help to Buy scheme.",
      images: ["https://picsum.photos/seed/house1a/800/400", "https://picsum.photos/seed/house1b/800/400"],
      price: 475000,
      floors: 2,
      bedrooms: 3,
      bathrooms: 3,
      floorAreaSqm: 112.5,
      floorAreaSqft: 1210.9,
      garageSpaces: 0,
      status: "published",
      publishedAt: new Date(),
    },
    {
      name: "2-Bed City Centre Apartment",
      berRating: "B2",
      style: "Apartment",
      description: "A bright and spacious 2nd-floor apartment located in the heart of the IFSC, Dublin 1. Ideal for young professionals or investors. Close to Luas red line.",
      images: ["https://picsum.photos/seed/house2a/800/400"],
      price: 410000,
      floors: 1,
      bedrooms: 2,
      bathrooms: 2,
      floorAreaSqm: 74.0,
      floorAreaSqft: 796.5,
      garageSpaces: 1,
      status: "published",
      publishedAt: new Date(),
    },
    {
      name: "4-Bed Detached (Galway Suburbs)",
      berRating: "C1",
      style: "Detached",
      description: "A well-maintained 4-bedroom detached home in Salthill, Galway. Boasts a large south-facing garden and is within walking distance of local schools and the promenade.",
      images: ["https://picsum.photos/seed/house3a/800/400", "https://picsum.photos/seed/house3b/800/400"],
      price: 595000,
      floors: 2,
      bedrooms: 4,
      bathrooms: 3,
      floorAreaSqm: 145.0,
      floorAreaSqft: 1560.8,
      garageSpaces: 1,
      status: "published",
      publishedAt: new Date(),
    },
    {
      name: "3-Bed Terraced House (Cork City)",
      berRating: "C3",
      style: "Terraced",
      description: "A charming mid-terrace redbrick property situated in Douglas, Cork. Requires some modernization but offers fantastic potential in a highly sought-after area.",
      images: ["https://picsum.photos/seed/house4a/800/400"],
      price: 330000,
      floors: 2,
      bedrooms: 3,
      bathrooms: 1,
      floorAreaSqm: 90.0,
      floorAreaSqft: 968.7,
      garageSpaces: 0,
      status: "published",
      publishedAt: new Date(),
    },
    {
      name: "5-Bed Luxury Detached (South Dublin)",
      berRating: "A3",
      style: "Detached",
      description: "An exceptional modern 5-bedroom luxury residence in Foxrock, Dublin 18. Finished to an impeccably high standard with a bespoke kitchen and landscaped grounds.",
      images: ["https://picsum.photos/seed/house5a/800/400", "https://picsum.photos/seed/house5b/800/400"],
      price: 1450000,
      floors: 3,
      bedrooms: 5,
      bathrooms: 4,
      floorAreaSqm: 260.0,
      floorAreaSqft: 2798.6,
      garageSpaces: 2,
      status: "published",
      publishedAt: new Date(),
    },
    {
      name: "3-Bed Bungalow (Co. Meath)",
      berRating: "E1",
      style: "Bungalow",
      description: "A traditional 3-bedroom detached bungalow set on 0.5 acres near Navan. Excellent potential for extension (subject to PP) and eligible for the Vacant Property Grant.",
      images: ["https://picsum.photos/seed/house6a/800/400"],
      price: 285000,
      floors: 1,
      bedrooms: 3,
      bathrooms: 1,
      floorAreaSqm: 105.0,
      floorAreaSqft: 1130.2,
      garageSpaces: 0,
      status: "published",
      publishedAt: new Date(),
    },
    {
      name: "2-Bed Duplex (West Dublin)",
      berRating: "B1",
      style: "Duplex",
      description: "A stylish and generously proportioned 2-bedroom own-door duplex apartment in Lucan, Co. Dublin. Features a large balcony and low management fees.",
      images: ["https://picsum.photos/seed/house7a/800/400"],
      price: 345000,
      floors: 2,
      bedrooms: 2,
      bathrooms: 2,
      floorAreaSqm: 88.0,
      floorAreaSqft: 947.2,
      garageSpaces: 1,
      status: "published",
      publishedAt: new Date(),
    },
    {
      name: "4-Bed Semi-Detached (Limerick)",
      berRating: "A2",
      style: "Semi-Detached",
      description: "A substantial 4-bedroom family home in Castletroy, Limerick. Part of an exclusive new development with easy access to the M7 motorway and local amenities.",
      images: ["https://picsum.photos/seed/house8a/800/400"],
      price: 435000,
      floors: 2,
      bedrooms: 4,
      bathrooms: 3,
      floorAreaSqm: 135.0,
      floorAreaSqft: 1453.1,
      garageSpaces: 0,
      status: "published",
      publishedAt: new Date(),
    },
    {
      name: "1-Bed City Pad (Dublin 8)",
      berRating: "D1",
      style: "Apartment",
      description: "A compact but perfectly formed 1-bedroom ground floor apartment in Portobello, Dublin 8. Unbeatable location within walking distance of St. Stephen's Green.",
      images: ["https://picsum.photos/seed/house9a/800/400"],
      price: 310000,
      floors: 1,
      bedrooms: 1,
      bathrooms: 1,
      floorAreaSqm: 45.0,
      floorAreaSqft: 484.3,
      garageSpaces: 0,
      status: "published",
      publishedAt: new Date(),
    },
    {
      name: "4-Bed Detached (Waterford)",
      berRating: "B3",
      style: "Detached",
      description: "A beautiful 4-bed detached home located on the Dunmore Road, Waterford. Excellent condition throughout with a large conservatory to the rear.",
      images: ["https://picsum.photos/seed/house10a/800/400"],
      price: 470000,
      floors: 2,
      bedrooms: 4,
      bathrooms: 3,
      floorAreaSqm: 155.0,
      floorAreaSqft: 1668.4,
      garageSpaces: 2,
      status: "draft", 
      publishedAt: null,
    }
  ];

  for (const house of houseTypesData) {
    await prisma.houseType.create({ data: house });
  }
  console.log('HouseTypes created.');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });