import { Account, Avatars, Client, Databases, ID, Models, OAuthProvider, Permission, Query, QueryTypesList, Role } from "react-native-appwrite"
import * as Linking from 'expo-linking'
import { openAuthSessionAsync } from "expo-web-browser";
// import sgMail from "@sendgrid/mail";
export const config = {
  platform: 'com.jsm.restate',
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  galleriesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
  reviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
  agentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,
  propertiesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID,
  detailsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_DETAILS_COLLECTION_ID,
  buildingsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_BUILDINGS_COLLECTION_ID,
  usersCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
  chatsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CHATS_COLLECTION_ID,
  messagesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID,
  bookingsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_BOOKINGS_COLLECTION_ID,
  pricingsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_PRICINGS_COLLECTION_ID,
  bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID,
  emailBooking: process.env.SENDGRID_EMAIL_BOOKING,
}
export const client = new Client();
client.setEndpoint(config.endpoint!).setProject(config.projectId!).setPlatform(config.platform!)
// sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);
interface ReviewData {
  userId: string;  // Now using documentId instead of userId object
  buildingId: string;
  rating: number;
  comment?: string;
}
interface Message {
  id: string;
  text: string;
  timeStamp: string;
  isRead: boolean;
  chatId: string;
  senderId: string;
}
const ALL_TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
  "05:00 PM"
];
export interface FilterType {
  type: string[];
  negotiable: boolean;
  bedrooms?: number | null;
  bathrooms?: number | null;
  priceRange: [number, number];
  areaRange: [number, number];
  rating?: number | null;
}

export const defaultFilters: FilterType = {
  type: [],
  negotiable: false,
  bedrooms: null,
  bathrooms: null,
  rating: null,
  priceRange: [0, 200000],
  areaRange: [0, 10000],
};
async function getUserDocument(userId: string) {
  try {
    // console.log(`[getUserDocument] Fetching user document for documentId: ${userId}`);

    const userDocument = await databases.getDocument(
      config.databaseId!,
      config.usersCollectionId!,
      userId
    );

    // console.log(`[getUserDocument] User document found:`, userDocument);
    return userDocument;
  } catch (error) {
    console.error(`[getUserDocument] Error fetching user document:`, error);
    return null;
  }
}
// ✅ Like a property (Add to user's `likes` array)
export async function likeProperty(userId: string, buildingId: string) {
  try {
    console.log(`[likeProperty] Attempting to like property ${buildingId} for user ${userId}`);

    const user = await getUserDocument(userId);
    if (!user) throw new Error(`User not found for userId: ${userId}`);

    const updatedLikes = user.likes ? [...user.likes, buildingId] : [buildingId];

    console.log(`[likeProperty] Updated likes array:`, updatedLikes);

    await databases.updateDocument(
      config.databaseId!,
      config.usersCollectionId!,
      user.$id,
      { likes: updatedLikes }
    );

    console.log(`[likeProperty] Property ${buildingId} successfully liked`);
    return true;
  } catch (error) {
    console.error(`[likeProperty] Error liking property:`, error);
    return false;
  }
}
export async function unlikeProperty(userId: string, buildingId: string) {
  try {
    console.log(`[unlikeProperty] Attempting to unlike property ${buildingId} for user ${userId}`);

    const user = await getUserDocument(userId);
    if (!user) throw new Error(`User not found for userId: ${userId}`);

    // Ensure likes is an array of document IDs
    const updatedLikes = user.likes?.map((like: any) => like.$id).filter((id: string) => id !== buildingId) || [];

    console.log(`[unlikeProperty] Updated likes list:`, updatedLikes);

    await databases.updateDocument(
      config.databaseId!,
      config.usersCollectionId!,
      user.$id,
      {
        likes: updatedLikes, // Updating with remaining relation IDs
      }
    );

    console.log(`[unlikeProperty] Property ${buildingId} successfully unliked`);
    return true;
  } catch (error) {
    console.error(`[unlikeProperty] Error unliking property:`, error);
    return false;
  }
}
export async function isPropertyLiked(userId: string, buildingId: string) {
  try {
    const user = await getUserDocument(userId);
    return user?.likes?.some((like: any) => like.$id === buildingId) || false;
  } catch (error) {
    console.error("Error checking like status:", error);
    return false;
  }
}
export async function getAllLikedBuildings(userId: string) {
  try {
    // Step 1: Fetch the user document by ID
    const userDoc = await databases.getDocument(
      config.databaseId!,
      config.usersCollectionId!,
      userId
    );

    // Step 2: Get the likes relation field (array of full building documents or IDs depending on your settings)
    const likedBuildings = userDoc.likes || [];

    return likedBuildings;
  } catch (error) {
    console.error("❌ Error fetching liked buildings:", error);
    return [];
  }
}
export async function login() {
  try {
    const redirectUri = Linking.createURL('/');
    const response = await account.createOAuth2Token(OAuthProvider.Google, redirectUri);
    if (!response)
      throw new Error("Failed to login")
    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    )
    if (browserResult.type !== 'success') {
      throw new Error("Failed to login")
    }
    const url = new URL(browserResult.url);
    const secret = url.searchParams.get('secret')?.toString();
    const userId = url.searchParams.get('userId')?.toString();

    if (!secret || !userId) {
      throw new Error("Failed to find user");
    }
    // ✅ First, create a session so the user is authenticated
    const session = await account.createSession(userId, secret);
    if (!session) throw new Error("Failed to create session");

    // ✅ Now, get the authenticated user details
    const user = await account.get();

    // ✅ Then, create user in the database (user is now authenticated)
    await createUserIfNotExists(user);

    return true;
  }
  catch (error) {
    console.error(error);
    return false;
  }
}
export async function createUserIfNotExists(userId: string) {
  try {
    console.log("🔍 [Debug] Function called with userId:", userId);

    // Step 1: Fetch authenticated user details
    const user = await account.get();
    if (!user) throw new Error("❌ [Error] User not authenticated");

    console.log("✅ [Debug] Authenticated user:", JSON.stringify(user, null, 2));

    // Step 2: Generate profile picture
    const profilePic = avatar.getInitials(user.name).toString();

    // Step 3: Check if user already exists in the database
    const existingUser = await databases.listDocuments(
      config.databaseId!,
      config.usersCollectionId!,
      [Query.equal("$id", [user.$id])] // Query using document ID
    );

    console.log("📄 [Debug] Existing user count:", existingUser.documents.length);

    if (existingUser.documents.length === 0) {
      // Step 4: Create a new user document
      console.log("📝 [Debug] Creating new user document...");

      const createdUser = await databases.createDocument(
        config.databaseId!,
        config.usersCollectionId!,
        user.$id, // Use user.$id as documentId
        {
          name: user.name,
          email: user.email,
          role: "user",
          profilePic: profilePic || "",
        }
      );

      console.log("✅ [Debug] User created successfully:", JSON.stringify(createdUser, null, 2));
    } else {
      console.log("⚠️ [Debug] User already exists in the database. No action needed.");
    }
  } catch (error) {
    console.error("❌ [Error] Creating user failed:", JSON.stringify(error, null, 2));
  }
}
export const getUserProfileById = async (userId: string) => {
  try {
    const user = await databases.getDocument(
      config.databaseId!,
      config.usersCollectionId!,
      userId // this is the document ID, assumed to be same as the user's $id
    );

    return {
      name: user.name,
      profilePic: user.profilePic || "https://via.placeholder.com/50",
    };
  } catch (error) {
    console.error("Failed to fetch user profile", error);
    return {
      name: "Unknown",
      profilePic: "https://via.placeholder.com/50",
    };
  }
};
export async function logout() {
  try {
    const result = await account.deleteSession("current");
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}
export async function getCurrentUser() {
  try {
    const result = await account.get();
    if (result.$id) {
      const userAvatar = avatar.getInitials(result.name);

      return {
        ...result,
        avatar: userAvatar.toString(),
      };
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getLatestProperties() {
  try {
    const result = await databases.listDocuments(
      config.databaseId!,
      config.buildingsCollectionId!,
      [Query.orderDesc("$createdAt"), Query.limit(5)]
    );

    const buildings = result.documents;

    const enrichedBuildings = await Promise.all(
      buildings.map(async (building) => {
        const pricingIds = building.pricing || [];

        let pricingData: Models.Document[] = [];

        if (pricingIds.length > 0) {
          try {
            const pricingResult = await databases.listDocuments(
              config.databaseId!,
              config.pricingsCollectionId!,
              [Query.equal("$id", pricingIds)]
            );
            pricingData = pricingResult.documents;
          } catch (err) {
            console.error(`Failed to fetch pricing for building ${building.$id}`, err);
          }
        }
        // console.log("Pricing Data:", pricingData);
        return {
          ...building,
          pricingDetails: pricingData, // attach actual pricing data here
        };
      })
    );

    return enrichedBuildings;
  } catch (error) {
    console.error("Failed to fetch latest properties:", error);
    return [];
  }
}

export async function getProperties({
  filter,
  query,
  limit,
}: {
  filter: string;
  query: string;
  limit?: number;
}) {
  try {
    const buildQuery = [Query.orderDesc("$createdAt")];

    if (filter && filter !== "All") {
      let allDetailDocs: any[] = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const detailsResult = await databases.listDocuments(
          config.databaseId!,
          config.detailsCollectionId!,
          [Query.equal("type", filter), Query.limit(100), Query.offset(offset)]
        );

        allDetailDocs = allDetailDocs.concat(detailsResult.documents);
        hasMore = detailsResult.documents.length === 100;
        offset += 100;
      }

      const detailIds = allDetailDocs.map((detail) => detail.$id);

      if (detailIds.length > 0) {
        let allBuildingDocs: any[] = [];

        for (let i = 0; i < detailIds.length; i += 100) {
          const chunk = detailIds.slice(i, i + 100);
          const buildingsResult = await databases.listDocuments(
            config.databaseId!,
            config.buildingsCollectionId!,
            [Query.equal("detail", chunk)]
          );
          allBuildingDocs = allBuildingDocs.concat(buildingsResult.documents);
        }

        // Fetch pricing details for each building
        const allPricings: any[] = [];

        for (const building of allBuildingDocs) {
          const pricingIds = Array.isArray(building.pricing) ? building.pricing : [];
          const pricingDocs: any[] = [];

          for (let i = 0; i < pricingIds.length; i += 100) {
            const chunk = pricingIds.slice(i, i + 100);
            const pricingResult = await databases.listDocuments(
              config.databaseId!,
              config.pricingsCollectionId!,
              [Query.equal("$id", chunk)]
            );
            pricingDocs.push(...pricingResult.documents);
          }

          building.pricingDetails = pricingDocs;
        }

        return allBuildingDocs;
      } else {
        return [];
      }
    }

    if (query) {
      buildQuery.push(
        Query.or([
          Query.search("buildingName", query),
          Query.search("address", query),
        ])
      );
    }

    if (limit) buildQuery.push(Query.limit(limit));

    const result = await databases.listDocuments(
      config.databaseId!,
      config.buildingsCollectionId!,
      buildQuery
    );

    // Fetch pricing details for each building (when no filter is applied)
    for (const building of result.documents) {
      const pricingIds = Array.isArray(building.pricing) ? building.pricing : [];
      const pricingDocs: any[] = [];

      for (let i = 0; i < pricingIds.length; i += 100) {
        const chunk = pricingIds.slice(i, i + 100);
        const pricingResult = await databases.listDocuments(
          config.databaseId!,
          config.pricingsCollectionId!,
          [Query.equal("$id", chunk)]
        );
        pricingDocs.push(...pricingResult.documents);
      }

      building.pricingDetails = pricingDocs;
    }

    return result.documents;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// write function to get property by id
export async function getPropertyById({ id }: { id: string }) {
  try {
    const result = await databases.getDocument(
      config.databaseId!,
      config.buildingsCollectionId!,
      id
    );
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}
export const getPropertyDetailsById = async ({ detailId }: { detailId: string }) => {
  if (!detailId) {
    // console.log("❌ No detailId provided!");
    return null; // Handle edge case
  }

  // console.log("🟢 Fetching details for ID:", detailId);

  try {
    const databases = new Databases(client);
    const response = await databases.getDocument(
      config.databaseId!,
      config.detailsCollectionId!,
      detailId
    );

    // console.log("✅ Details fetched:", response);
    return response;
  } catch (error) {
    // console.error("❌ Error fetching details:", error);
    return null;
  }
};
export async function fetchFeatureVector(images: string[]): Promise<string[]> {
  try {
    console.log("📌 Sending image URLs for feature extraction...");

    const formData = new FormData();
    images.forEach((url) => formData.append("urls", url)); // Append each URL to form data
    // console.log("FormData:",formData)
    const response = await fetch("http://192.168.0.8:8000/extract_features_from_urls/", {
      method: "POST",
      body: formData,
    });
    // console.log(response);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    // console.log("✅ Feature vectors received:", data.features);

    return data.features || []; // Ensure we return an array of feature vectors
  } catch (error) {
    console.error("❌ Error fetching feature vector:", error);
    return [];
  }
}
export async function createBuildingWithDetails({
  latitude,
  longitude,
  buildingName,
  address,
  country,
  price,
  description,
  type,
  area,
  bedrooms,
  bathrooms,
  yearBuilt,
  exteriorImage_url,
  allImages_url,
  features_image_url,
  features_feature_vector,
  facilities,
  pricingList,
  sellerId,
}: {
  latitude: number;
  longitude: number;
  buildingName: string;
  address: string;
  country: string;
  price: number;
  description: string;
  type: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  exteriorImage_url: string[];
  allImages_url: string[];
  features_image_url: string[];
  features_feature_vector: string[];
  facilities: string[];
  pricingList: {
    amount: number;
    type: string;
    unit: string;
    negotiable: boolean;
  }[],
  sellerId: string;
}) {
  try {
    // Step 1: Create Details
    const detailsResult = await databases.createDocument(
      config.databaseId!,
      config.detailsCollectionId!,
      ID.unique(),
      {
        buildingName,
        type,
        area,
        bedrooms,
        bathrooms,
        facilities,
        yearBuilt,
      }
    );
    const detailId = detailsResult.$id;

    // Step 2: Create Building (we need its ID for pricing)
    const buildingResult = await databases.createDocument(
      config.databaseId!,
      config.buildingsCollectionId!,
      ID.unique(),
      {
        latitude,
        longitude,
        buildingName,
        address,
        country,
        price,
        description,
        exteriorImage_url,
        allImages_url,
        features_image_url,
        features_feature_vector,
        detail: detailId,
        pricing: [],
        sellerId, // temp empty array — we’ll update next
      }
    );
    const buildingId = buildingResult.$id;

    // Step 3: Create Pricing options with buildingId
    const pricingPromises = pricingList.map((pricingItem) =>
      databases.createDocument(
        config.databaseId!,
        config.pricingsCollectionId!,
        ID.unique(),
        {
          buildingId, // ✅ important addition
          amount: Number(pricingItem.amount),
          type: pricingItem.type,
          unit: pricingItem.unit,
          negotiable: pricingItem.negotiable,
        }
      )
    );
    const pricingResults = await Promise.all(pricingPromises);
    const pricingIds = pricingResults.map((p) => p.$id);

    // Step 4: Update building document with pricing references
    await databases.updateDocument(
      config.databaseId!,
      config.buildingsCollectionId!,
      buildingId,
      {
        pricing: pricingIds,
      }
    );

    return {
      building: buildingResult,
      details: detailsResult,
      pricing: pricingResults,
    };
  } catch (error) {
    console.error("❌ Error creating building with details and pricing:", error);
    return null;
  }
}

export async function updateBuildingWithDetails({
  buildingId,
  detailId,
  latitude,
  longitude,
  buildingName,
  address,
  country,
  price,
  description,
  type,
  area,
  bedrooms,
  bathrooms,
  yearBuilt,
  exteriorImage_url,
  allImages_url,
  features_image_url,
  features_feature_vector,
  facilities,
  pricingList,
}: {
  buildingId: string;
  detailId: string;
  latitude: number;
  longitude: number;
  buildingName: string;
  address: string;
  country: string;
  price: number;
  description: string;
  type: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  exteriorImage_url: string[];
  allImages_url: string[];
  features_image_url: string[];
  features_feature_vector: string[];
  facilities: string[];
  pricingList: {
    id?: string;
    amount: number;
    type: string;
    unit: string;
    negotiable: boolean;
  }[];
}) {
  try {
    // Step 1: Update Details
    await databases.updateDocument(
      config.databaseId!,
      config.detailsCollectionId!,
      detailId,
      {
        buildingName,
        type,
        area,
        bedrooms,
        bathrooms,
        facilities,
        yearBuilt,
      }
    );

    // Step 2: Update Building
    await databases.updateDocument(
      config.databaseId!,
      config.buildingsCollectionId!,
      buildingId,
      {
        latitude,
        longitude,
        buildingName,
        address,
        country,
        price,
        description,
        exteriorImage_url,
        allImages_url,
        features_image_url,
        features_feature_vector,
      }
    );

    // Step 3: Update or Create Pricing
    const pricingIds: string[] = [];
    for (const pricing of pricingList) {
      if (pricing.id) {
        await databases.updateDocument(
          config.databaseId!,
          config.pricingsCollectionId!,
          pricing.id,
          {
            amount: pricing.amount,
            type: pricing.type,
            unit: pricing.unit,
            negotiable: pricing.negotiable,
          }
        );
        pricingIds.push(pricing.id);
      } else {
        const result = await databases.createDocument(
          config.databaseId!,
          config.pricingsCollectionId!,
          ID.unique(),
          {
            buildingId,
            amount: pricing.amount,
            type: pricing.type,
            unit: pricing.unit,
            negotiable: pricing.negotiable,
          }
        );
        pricingIds.push(result.$id);
      }
    }

    // Step 4: Sync pricing IDs with building
    await databases.updateDocument(
      config.databaseId!,
      config.buildingsCollectionId!,
      buildingId,
      {
        pricing: pricingIds,
      }
    );

    return { success: true, buildingId };
  } catch (error) {
    console.error("❌ Error updating building:", error);
    return { success: false, error };
  }
}
export async function getBuildingById(buildingId: string) {
  try {
    console.log("Fetching building with ID:", buildingId);

    const building = await databases.getDocument(
      config.databaseId!,
      config.buildingsCollectionId!,
      buildingId
    );

    let details = null;
    if (
      building.detail &&
      typeof building.detail === "string" &&
      building.detail.length <= 36 &&
      /^[a-zA-Z0-9_]+$/.test(building.detail)
    ) {
      details = await databases.getDocument(
        config.databaseId!,
        config.detailsCollectionId!,
        building.detail
      );
    }

    let pricingList: Models.Document[] = [];
    if (Array.isArray(building.pricing)) {
      const validPricingIds = building.pricing.filter(
        (id) => typeof id === "string" && id.length <= 36 && /^[a-zA-Z0-9_]+$/.test(id)
      );

      const chunkSize = 100;
      const chunks = [];
      for (let i = 0; i < validPricingIds.length; i += chunkSize) {
        chunks.push(validPricingIds.slice(i, i + chunkSize));
      }

      const pricingResponses = await Promise.all(
        chunks.map((chunk) =>
          databases.listDocuments(
            config.databaseId!,
            config.pricingsCollectionId!,
            [Query.equal("$id", chunk)]
          )
        )
      );

      pricingList = pricingResponses.flatMap((res) => res.documents);
    }
    console.log("Fetched All");
    return {
      ...building,
      details,
      pricingList,
    };
  } catch (error) {
    console.error("❌ Error fetching building by ID:", error);
    return null;
  }
}
export const createReview = async ({
  userId,
  buildingId,
  rating,
  comment = "",
}: ReviewData): Promise<boolean> => {
  try {
    // console.log("🔍 [Debug] Function called with:");
    // console.log("  userId (documentId):", userId);
    // console.log("  buildingId:", buildingId);
    // console.log("  rating:", rating);
    // console.log("  comment:", comment);

    if (!userId || !buildingId || !rating) {
      console.error("❌ [Error] Missing required parameters.");
      return false;
    }
    // console.log("✅ [Debug] Required parameters exist.");

    // 🛠 Step 1: Create Review Document
    // console.log("🛠 [Debug] Creating review document...");
    const reviewData = { rating, comment, createdAt: new Date().toISOString() };

    const createdReview = await databases.createDocument(
      config.databaseId!,
      config.reviewsCollectionId!,
      ID.unique(),
      reviewData
    );

    // console.log("✅ [Debug] Review created successfully!", createdReview.$id);

    // 🔗 Step 2: Link the review to User & Building
    // console.log("🔗 [Debug] Fetching existing User & Building reviews...");

    const userDoc = await databases.getDocument(
      config.databaseId!,
      config.usersCollectionId!,
      userId
    );

    const buildingDoc = await databases.getDocument(
      config.databaseId!,
      config.buildingsCollectionId!,
      buildingId
    );

    const updatedUserReviews = [...(userDoc.reviews || []), createdReview.$id];
    const updatedBuildingReviews = [...(buildingDoc.reviews || []), createdReview.$id];

    // console.log("🛠 [Debug] Updating User & Building with new review...");

    await databases.updateDocument(
      config.databaseId!,
      config.usersCollectionId!,
      userId,
      { reviews: updatedUserReviews } // Pass as array
    );

    await databases.updateDocument(
      config.databaseId!,
      config.buildingsCollectionId!,
      buildingId,
      { reviews: updatedBuildingReviews } // Pass as array
    );

    // console.log("✅ [Debug] Review successfully linked to User and Building.");
    return true;
  } catch (error) {
    console.error("❌ [Error] createReview failed:", JSON.stringify(error, null, 2));
    return false;
  }
};

export async function getReviewsByBuildingId(buildingId: string) {
  try {
    // console.log("Fetching building data for ID:", buildingId);

    // Step 1: Fetch building document to get review IDs
    const buildingResponse = await databases.getDocument(
      config.databaseId!,
      config.buildingsCollectionId!,
      buildingId
    );

    // console.log("Building Response:", buildingResponse);

    if (!buildingResponse || !Array.isArray(buildingResponse.reviews)) {
      console.error("No reviews found for this building.");
      return [];
    }

    const reviewIds = buildingResponse.reviews; // Array of review objects
    const reviewIdsList = reviewIds.map((review: any) => review.$id); // Extract only review IDs
    // console.log("Extracted Review IDs:", reviewIdsList);

    let reviews: any[] = [];

    // Step 2: Fetch all users (since users contain review references)
    // console.log("Fetching all users...");
    const usersResponse = await databases.listDocuments(
      config.databaseId!,
      config.usersCollectionId!
    );
    // console.log("Users Response:", usersResponse.documents);

    // Step 3: Match reviews to users
    for (let user of usersResponse.documents) {
      // console.log(`Checking reviews for user: ${user.name} (ID: ${user.$id})`);

      const userReviewIds = Array.isArray(user.reviews)
        ? user.reviews.map((review: any) => review.$id)
        : [];

      console.log(`User ${user.name} has review IDs:`, userReviewIds);

      const matchingReviews = userReviewIds.filter((reviewId: string) =>
        reviewIdsList.includes(reviewId)
      );

      // console.log(`Matching reviews for user ${user.name}:`, matchingReviews);

      for (let reviewId of matchingReviews) {
        // console.log("Fetching review details for ID:", reviewId);
        const reviewResponse = await databases.getDocument(
          config.databaseId!,
          config.reviewsCollectionId!,
          reviewId
        );
        // console.log("Fetched review:", reviewResponse);

        reviews.push({
          ...reviewResponse,
          user: {
            name: user.name,
            profilePic: user.profilePic || "https://via.placeholder.com/50"
          }
        });
      }
    }

    // console.log("Final reviews list:", reviews);
    return reviews;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}
export const updateBuildingRating = async (buildingId: string, newRating: number) => {
  await databases.updateDocument(
    config.databaseId!,
    config.buildingsCollectionId!,
    buildingId,
    { rating: newRating }
  );
};
export const updateBuildingRatingAverage = async (buildingId: string) => {
  try {
    const reviews = await getReviewsByBuildingId(buildingId);
    if (!reviews || reviews.length === 0) {
      await updateBuildingRating(buildingId, 0); // Set to 0 if no reviews
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = (totalRating / reviews.length).toFixed(1); // Round to 1 decimal

    // Update building's rating in the database
    await updateBuildingRating(buildingId, parseFloat(avgRating));
    // console.log(`Updated building ${buildingId} rating to ${avgRating}`);
  } catch (error) {
    console.error("Error updating building rating:", error);
  }
};

//CHATS
export const startChatWithSeller = async (buyerId: string, buildingId: string) => {
  try {
    console.log("🔍 [Debug] Function called with:");
    console.log("  buyerId:", buyerId);
    console.log("  buildingId:", buildingId);

    // 🏡 Fetch building details to get sellerId
    const building = await databases.getDocument(
      config.databaseId!,
      config.buildingsCollectionId!,
      buildingId
    );
    console.log("✅ [Debug] Building fetched:", building);

    // Extract sellerId correctly
    const sellerId = building.sellerId?.$id || building.sellerId;
    if (!sellerId) {
      throw new Error("❌ Seller not found for this building.");
    }
    console.log("✅ [Debug] Seller ID:", sellerId);

    // 🔎 Fix query to check if chat exists
    console.log("🔍 [Debug] Checking if chat already exists...");
    console.log("Buyer Id", buyerId);
    console.log("Seller Id", sellerId);
    console.log(typeof buyerId, buyerId); // Should be 'string'
    console.log(typeof sellerId, sellerId);
    const existingChats = await databases.listDocuments(
      config.databaseId!,
      config.chatsCollectionId!,
      [
        Query.equal("buyerId", buyerId),
        Query.equal("sellerId", sellerId)
      ]
    );





    console.log("✅ [Debug] Existing chats found:", existingChats.documents.length);

    if (existingChats.documents.length > 0) {
      console.log("✅ [Debug] Chat already exists!", existingChats.documents[0]);
      return existingChats.documents[0]; // Return existing chat
    }

    // 🛠 Create new chat
    console.log("🛠 [Debug] Creating new chat...");
    const newChat = await databases.createDocument(
      config.databaseId!,
      config.chatsCollectionId!,
      ID.unique(),
      {
        buyerId,
        sellerId,
        buildingId,
        lastMessage: "", // Initialize as empty or default value
        lastMessageTimestamp: new Date().toISOString() // Store current timestamp
      }
    );


    console.log("✅ [Debug] Chat created successfully!", newChat);
    return newChat;
  } catch (error) {
    console.error("❌ [Error] startChatWithSeller failed:", JSON.stringify(error, null, 2));
    return null;
  }
};
export const getChatByUsers = async (buyerId: string, sellerId: string) => {
  console.log(buyerId, sellerId);
  try {
    const chats = await databases.listDocuments(
      config.databaseId!,
      config.chatsCollectionId!,
      [Query.equal("buyerId", buyerId), Query.equal("sellerId", sellerId)]
    );

    if (chats.documents.length === 0) {
      console.log("❌ No chat found between users.");
      return null;
    }

    console.log("✅ Chat found:", chats.documents[0].$id);
    return chats.documents[0];
  } catch (error) {
    console.error("❌ [Error] getChatByUsers failed:", error);
    return null;
  }
};
export const getUserChats = async (userId: string) => {
  try {
    const chats = await databases.listDocuments(
      config.databaseId!,
      config.chatsCollectionId!,
      [Query.or([Query.equal("buyerId", userId), Query.equal("sellerId", userId)])]
    );

    // Fetch other user details for each chat
    const chatsWithUserDetails = await Promise.all(
      chats.documents.map(async (chat) => {
        const otherUserId = chat.buyerId === userId ? chat.sellerId : chat.buyerId;
        const userDetails = await databases.getDocument(
          config.databaseId!,
          config.usersCollectionId!,
          otherUserId
        );

        return {
          ...chat,
          otherUserDetails: userDetails, // Attach full details
        };
      })
    );

    console.log(`✅ Found ${chatsWithUserDetails.length} chats for user: ${userId}`);
    return chatsWithUserDetails;
  } catch (error) {
    console.error("❌ [Error] getUserChats failed:", error);
    return [];
  }
};
export const getChatById = async (chatId: string) => {
  try {
    const chat = await databases.getDocument(
      config.databaseId!,
      config.chatsCollectionId!,
      chatId
    );
    console.log("✅ Chat fetched:", chat);
    return chat;
  } catch (error) {
    console.error("❌ [Error] getChatById failed:", error);
    return null;
  }
};

export const getMessagesByChatId = async (chatId: string): Promise<Message[]> => {
  try {
    const response = await databases.listDocuments(
      config.databaseId!,
      config.messagesCollectionId!,
      [Query.equal("chatId", chatId), Query.orderAsc("timeStamp")]
    );

    return response.documents.map((doc) => ({
      id: doc.$id,
      text: doc.text,
      timeStamp: doc.timeStamp,
      isRead: doc.isRead,
      chatId: doc.chatId,
      senderId: doc.senderId,
    }));
  } catch (error) {
    console.error("❌ Failed to fetch messages:", error);
    return [];
  }
};

// Send a new message
export const sendMessage = async (chatId: string, senderId: string, text: string): Promise<Message | null> => {
  try {
    const response = await databases.createDocument(
      config.databaseId!,
      config.messagesCollectionId!,
      ID.unique(),
      {
        chatId,
        senderId,
        text,
        timeStamp: new Date().toISOString(),
        isRead: false,
      },
      [
        // Permission.read(Role.user(senderId)), // Only sender can read
        // Permission.read(Role.user(chatId)), // Allow chat participants to read
        // Permission.write(Role.user(senderId)), // Sender can modify
      ]
    );

    return {
      id: response.$id,
      text: response.text,
      timeStamp: response.timeStamp,
      isRead: response.isRead,
      chatId: response.chatId,
      senderId: response.senderId,
    };
  } catch (error) {
    console.error("❌ Failed to send message:", error);
    return null;
  }
};
// Subscribe to real-time messages
export const subscribeToMessages = (chatId: string, callback: (message: Message) => void) => {
  const unsubscribe = client.subscribe(
    `databases.${config.databaseId}.collections.${config.messagesCollectionId}.documents`,
    (response) => {
      if (response.events.includes("databases.*.collections.*.documents.*.create")) {
        const message = response.payload as Message;
        if (message.chatId === chatId) {
          callback(message);
        }
      }
    }
  );

  return unsubscribe;
};

//Bookings

export const updateBooking = async (
  bookingId: string,
  updates: {
    date?: Date;
    timeSlot?: string;
    status?: string;
  }
) => {
  try {
    const payload: Record<string, any> = {};

    if (updates.date) payload.date = updates.date.toISOString();
    if (updates.timeSlot) payload.timeSlot = updates.timeSlot;
    if (updates.status) payload.status = updates.status;

    console.log("🔄 [Debug] Updating booking:", bookingId);
    console.log("With data:", payload);

    const updatedBooking = await databases.updateDocument(
      config.databaseId!,
      config.bookingsCollectionId!,
      bookingId,
      payload
    );

    console.log("✅ [Debug] Booking updated:", updatedBooking);
    return updatedBooking;
  } catch (error) {
    console.error("❌ [Error] updateBooking failed:", JSON.stringify(error, null, 2));
    throw error;
  }
};
export const getAvailableTimeSlots = async ({
  buildingId,
  date,
}: {
  buildingId: string;
  date: Date;
}) => {
  try {
    console.log("🔍 [Debug] Checking available time slots...");
    console.log("Building ID:", buildingId);
    console.log("Date:", date);

    const dateStr = date.toISOString().split("T")[0];
    const startOfDay = new Date(dateStr + "T00:00:00.000Z").toISOString();
    const endOfDay = new Date(dateStr + "T23:59:59.999Z").toISOString();

    const response = await databases.listDocuments(
      config.databaseId!,
      config.bookingsCollectionId!,
      [
        Query.equal("buildingId", buildingId),
        Query.greaterThanEqual("date", startOfDay),
        Query.lessThan("date", endOfDay),
      ]
    );

    const bookedSlots = response.documents
      .filter(doc => doc.status === "confirmed")
      .map(doc => doc.timeSlot);

    const availableSlots = ALL_TIME_SLOTS.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    console.log("✅ [Debug] Available slots:", availableSlots);

    return availableSlots;
  } catch (error) {
    console.error("❌ [Error] getAvailableTimeSlots failed:", JSON.stringify(error, null, 2));
    throw error;
  }
};
export async function checkExistingBooking({
  userId,
  buildingId,
  booking_type,
}: {
  userId: string;
  buildingId: string;
  booking_type?: string;
}) {
  try {
    const queries = [
      Query.equal("userId", userId),
      Query.equal("buildingId", buildingId),
      Query.equal("status", ["pending", "confirmed"]),
    ];
    if (booking_type) queries.push(Query.equal("booking_type", booking_type));

    const response = await databases.listDocuments(
      config.databaseId!,
      config.bookingsCollectionId!,
      queries
    );

    return response.documents.length > 0 ? response.documents[0] : null;
  } catch (error) {
    console.error("Error checking existing booking:", error);
    return null;
  }
}
export const getUserBookings = async (userId: string) => {
  try {
    // Fetch bookings where the user is the buyer
    const buyerBookingsResponse = await databases.listDocuments(
      config.databaseId!,
      config.bookingsCollectionId!,
      [Query.equal("userId", userId)]
    );
    const buyerBookings = buyerBookingsResponse.documents;

    // Fetch buildings where the user is the seller
    const sellerBuildingsResponse = await databases.listDocuments(
      config.databaseId!,
      config.buildingsCollectionId!,
      [Query.equal("sellerId", userId)]
    );
    const sellerBuildingIds = sellerBuildingsResponse.documents.map((b) => b.$id);

    // 🛑 If user has no buildings, return early to avoid Appwrite error
    if (sellerBuildingIds.length === 0) {
      return { buyerBookings, sellerBookings: [] };
    }

    // Fetch bookings for buildings owned by the user
    const sellerBookingsResponse = await databases.listDocuments(
      config.databaseId!,
      config.bookingsCollectionId!,
      [Query.equal("buildingId", sellerBuildingIds)] // Runs only if seller has buildings
    );
    const sellerBookings = sellerBookingsResponse.documents;

    return { buyerBookings, sellerBookings };
  } catch (error) {
    console.error("❌ Error fetching user bookings:", error);
    return { buyerBookings: [], sellerBookings: [] };
  }
};

export async function getMyListedBuildings(userId: string) {
  try {
    if (!userId) throw new Error("User ID is required");

    const response = await databases.listDocuments(
      config.databaseId!,
      config.buildingsCollectionId!,
      [Query.equal("sellerId", userId)]
    );

    return response.documents;
  } catch (error) {
    console.error("❌ Error fetching buildings by sellerId:", error);
    return [];
  }
}

export const getPricingByIds = async (ids: string[]) => {
  if (!ids || ids.length === 0) return [];

  try {
    const response = await databases.listDocuments(
      config.databaseId!,
      config.pricingsCollectionId!,
      [Query.equal("$id", ids)]
    );

    return response.documents;
  } catch (error) {
    console.error("Failed to fetch pricing documents:", error);
    return [];
  }
};

export const createBooking = async ({
  userId,
  buildingId,
  date,
  timeSlot,
  booking_type,
  status = "pending",
}: {
  userId: string;
  buildingId: string;
  date: Date;
  timeSlot: string;
  booking_type: "physical" | "live_tour";
  status?: string;
}) => {
  try {
    console.log("🔍 Starting createBooking:", {
      booking_type,
      buildingId,
      userId,
      date,
      timeSlot,
    });

    // 1️⃣ Conflict check
    const conflict = await databases.listDocuments(
      config.databaseId!,
      config.bookingsCollectionId!,
      [
        Query.equal("buildingId", buildingId),
        Query.equal("date", date.toISOString()),
        Query.equal("timeSlot", timeSlot),
        Query.equal("status", ["pending", "confirmed"]),
      ]
    );
    console.log("⏳ Conflict check response:", conflict.total);
    if (conflict.total > 0)
      throw new Error("Time slot already booked.");

    // 2️⃣ Fetch sellerId from buildings
    const building = await databases.getDocument(
      config.databaseId!,
      config.buildingsCollectionId!,
      buildingId
    );
    const sellerId = building.sellerId.$id;
    console.log("👤 Seller ID:", sellerId);

    // 3️⃣ Jitsi room generation
    let jitsiRoom: string | null = null;
    let jitsiLink: string | null = null;

    if (booking_type === "live_tour") {
      jitsiRoom = `${buildingId}_${userId}_${Date.now()}`;
      jitsiLink = `https://meet.ffmuc.net/${jitsiRoom}`;
      console.log("🎥 Generated Jitsi room:", jitsiLink);
    }

    // 4️⃣ Final booking creation
    const booking = await databases.createDocument(
      config.databaseId!,
      config.bookingsCollectionId!,
      ID.unique(),
      {
        userId,
        buildingId,
        sellerId,
        date: date.toISOString(),
        timeSlot,
        booking_type,
        status,
        createdAt: new Date().toISOString(),

        // Jitsi metadata
        jitsiRoom,
        jitsiLink,
        hostJoined: false,
        userJoined: false,
      }
    );
    // if (booking_type === "live_tour") {
    //   const buyer = await databases.getDocument(config.databaseId!, config.usersCollectionId!, userId);
    //   const seller = await databases.getDocument(config.databaseId!, config.usersCollectionId!, sellerId);

    //   await sendBookingEmail({
    //     buyerEmail: buyer.email,
    //     sellerEmail: seller.email,
    //     jitsiLink: jitsiLink!,
    //     buildingName: building.name,
    //     date: date.toDateString(),
    //     timeSlot,
    //   });
    // }
    console.log("🎉 Booking created successfully:", booking);
    return booking;
  } catch (err: any) {
    console.error("❌ createBooking failed:", err.message ?? err);
    throw err;
  }
};
// export const sendBookingEmail = async ({
//   buyerEmail,
//   sellerEmail,
//   jitsiLink,
//   buildingName,
//   date,
//   timeSlot,
// }: {
//   buyerEmail: string;
//   sellerEmail: string;
//   jitsiLink: string;
//   buildingName: string;
//   date: string;
//   timeSlot: string;
// }) => {
//   const subject = `Live Tour Scheduled - ${buildingName}`;
//   const htmlContent = `
//     <h2>📅 Your Live Tour is Confirmed</h2>
//     <p><strong>🏢 Building:</strong> ${buildingName}</p>
//     <p><strong>📆 Date:</strong> ${date}</p>
//     <p><strong>⏰ Time:</strong> ${timeSlot}</p>
//     <p><strong>🔗 Meeting Link:</strong> <a href="${jitsiLink}">${jitsiLink}</a></p>
//     <br/>
//     <p>👉 Please join the meeting on time. This link will activate at the scheduled time.</p>
//   `;

//   const msg = {
//     from: "manavshah.2003.ms@gmail.com", // ✅ Use a verified SendGrid sender email here later
//     subject,
//     html: htmlContent,
//   };

//   try {
//     await Promise.all([
//       sgMail.send({ ...msg, to: buyerEmail }),
//       sgMail.send({ ...msg, to: sellerEmail }),
//     ]);
//     console.log("📨 Emails sent successfully to buyer & seller.");
//   } catch (error: any) {
//     console.error("❌ Error sending booking email:", error?.response?.body || error.message);
//   }
// };

export const getBookingById = async (id: string) => {
  return await databases.getDocument(config.databaseId!, config.bookingsCollectionId!, id);
};

export async function filterBuildingsWithDetails(filters: FilterType) {
  try {
    const {
      type,
      negotiable,
      bedrooms,
      bathrooms,
      rating,
      priceRange,
      areaRange,
    } = filters;

    const buildings = await databases.listDocuments(
      config.databaseId!,
      config.buildingsCollectionId!,
      [] // Optional server-side filters can be added here
    );

    console.log("Fetched buildings count:", buildings.documents.length);
    console.log("Applied filters:", filters);

    const filtered = buildings.documents.filter((b, idx) => {
      const matchesType = type?.length ? type.includes(b.type) : true;

      const matchesNegotiable =
        negotiable === undefined || negotiable === null
          ? true
          : b.pricingList?.some((p: any) => p.negotiable === negotiable);

      const matchesBedrooms = bedrooms ? b.bedrooms >= bedrooms : true;
      const matchesBathrooms = bathrooms ? b.bathrooms >= bathrooms : true;
      const matchesRating = rating ? b.avgRating >= rating : true;

      const matchesPrice =
        b.price >= priceRange[0] && b.price <= priceRange[1];

      const matchesArea =
        b.area >= areaRange[0] && b.area <= areaRange[1];

      const matchesAll =
        matchesType &&
        matchesNegotiable &&
        matchesBedrooms &&
        matchesBathrooms &&
        matchesRating &&
        matchesPrice &&
        matchesArea;

      // Debugging for each building
      console.log(`Building #${idx + 1}: ${b.buildingName || b.$id}`);
      console.log({
        type: b.type,
        price: b.price,
        area: b.area,
        bedrooms: b.bedrooms,
        bathrooms: b.bathrooms,
        avgRating: b.avgRating,
        pricingList: b.pricingList,
        matchesType,
        matchesNegotiable,
        matchesBedrooms,
        matchesBathrooms,
        matchesRating,
        matchesPrice,
        matchesArea,
        matchesAll,
      });

      return matchesAll;
    });

    console.log("Filtered buildings count:", filtered.length);
    return filtered;
  } catch (err) {
    console.error("Error filtering buildings:", err);
    return [];
  }
}

export const getLiveTourBooking = async (buildingId: string, date: Date) => {
  const response = await databases.listDocuments(
    config.databaseId!,
    config.bookingsCollectionId!,
    [
      Query.equal("buildingId", buildingId),
      Query.equal("date", date.toISOString().split("T")[0]), // YYYY-MM-DD
      Query.equal("booking_type", "live_tour"),
      Query.equal("status", ["pending", "confirmed"]),
    ]
  );
  return response.documents[0]; // assuming only one per slot
};






