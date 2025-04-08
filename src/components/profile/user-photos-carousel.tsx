"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  IconLibraryPhoto,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconCircleChevronLeftFilled,
  IconCircleChevronRightFilled,
  IconTrash,
} from "@tabler/icons-react";

// Define types
type UserPhoto = {
  id: string;
  user_id: string;
  photo_url: string;
  created_at: string;
};

export default function UserPhotosCarousel({
  userId,
  currentUserId,
}: {
  userId: string;
  currentUserId: string;
}) {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [fullscreenImage, setFullScreenImage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<{
    id: string;
    url: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const carouselRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isOwnProfile = userId === currentUserId;

  useEffect(() => {
    const fetchUserPhotos = async () => {
      setIsLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("user_photos")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPhotos(data);
      } else {
        console.error("Error fetching user photos:", error);
      }

      setIsLoading(false);
    };

    fetchUserPhotos();
  }, [userId]);

  useEffect(() => {
    if (showFullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showFullScreen]);

  const handleUploadPhoto = async () => {
    const supabase = createClient();

    // Create file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.click();

    fileInput.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) return;

      try {
        // First, we'll check the image with Sightengine
        const formData = new FormData();
        formData.append("media", file);
        formData.append(
          "models",
          "nudity-2.1,weapon,recreational_drug,gore-2.0,violence",
        );
        formData.append(
          "api_user",
          process.env.NEXT_PUBLIC_SIGHTENGINE_API_USER!,
        );
        formData.append(
          "api_secret",
          process.env.NEXT_PUBLIC_SIGHTENGINE_API_SECRET!,
        );

        // Make the API call to Sightengine
        const moderationResponse = await fetch(
          "https://api.sightengine.com/1.0/check.json",
          {
            method: "POST",
            body: formData,
          },
        );

        const moderationResult = await moderationResponse.json();

        // Check if the image violates content policy
        // You can adjust these thresholds based on your requirements
        if (
          moderationResult.nudity?.raw > 0.6 ||
          moderationResult.nudity?.partial > 0.6 ||
          moderationResult.weapon > 0.6 ||
          moderationResult.drugs > 0.6 ||
          moderationResult.gore?.prob > 0.6 ||
          moderationResult.violence > 0.6
        ) {
          throw new Error(
            "This image contains inappropriate content and cannot be uploaded.",
          );
        }

        console.log(moderationResult);

        // If image passes moderation, proceed with upload
        const fileExt = file.name.split(".").pop();
        const filePath = `${currentUserId}/${Date.now()}.${fileExt}`;

        // Upload to Supabase Storage with the correct path
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("user.photos")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from("user.photos")
          .getPublicUrl(filePath);

        const photoUrl = publicUrlData.publicUrl;

        // Add record to user_photos table
        const { data: photoData, error: photoError } = await supabase
          .from("user_photos")
          .insert([
            {
              user_id: currentUserId,
              photo_url: photoUrl,
            },
          ])
          .select()
          .single();

        if (photoError) throw photoError;

        // Update local state with the new photo
        setPhotos((prevPhotos) => [photoData, ...prevPhotos]);
      } catch (error: unknown) {
        console.error("Error uploading photo:", error);

        let errorMessage = "Failed to upload photo. Please try again.";

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (
          typeof error === "object" &&
          error !== null &&
          "message" in error
        ) {
          errorMessage = (
            error as {
              message: string;
            }
          ).message;
        }

        alert(errorMessage);
      }
    };
  };

  const handleDeletePhoto = async () => {
    if (!photoToDelete) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      const supabase = createClient();

      // Extract the file path from the URL
      const filePathMatch = photoToDelete.url.match(/user\.photos\/([^?]+)/);
      if (!filePathMatch) throw new Error("Could not extract file path");

      const filePath = filePathMatch[1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("user.photos")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("user_photos")
        .delete()
        .eq("id", photoToDelete.id);

      if (dbError) throw dbError;

      // Update local state
      setPhotos(photos.filter((photo) => photo.id !== photoToDelete.id));
      setShowDeleteConfirm(false);
      setPhotoToDelete(null);
    } catch (error: unknown) {
      console.error("Error deleting photo:", error);

      let errorMessage = "Failed to delete photo. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        errorMessage = (error as { message: string }).message;
      }

      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const navigateCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    // Use a standard width for scrolling
    const scrollAmount = 100;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const showPhotoFullscreen = (photoUrl: string, index: number) => {
    setFullScreenImage(photoUrl);
    setCurrentIndex(index);
    setShowFullScreen(true);
  };

  const navigateFullscreen = (direction: "prev" | "next") => {
    const photoCount = photos.length;
    if (photoCount === 0) return;

    let newIndex;

    if (direction === "prev") {
      newIndex = currentIndex - 1;
      if (newIndex < 0) newIndex = photoCount - 1;
    } else {
      newIndex = currentIndex + 1;
      if (newIndex >= photoCount) newIndex = 0;
    }

    setCurrentIndex(newIndex);
    setFullScreenImage(photos[newIndex].photo_url);
  };

  if (isLoading) {
    return (
      <div className="w-full h-52 my-3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
    );
  }

  // If there are no photos and it's not the user's own profile, don't show anything
  if (photos.length === 0 && !isOwnProfile) {
    return null;
  }

  return (
    <div ref={containerRef} className={`group/carousel my-3 w-full relative`}>
      {/* Carousel */}
      <div
        ref={carouselRef}
        className={`w-full overflow-x-auto scrollbar-hide flex gap-2`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Upload button (only for own profile) */}
        {isOwnProfile && (
          <div
            onClick={handleUploadPhoto}
            className={`group/new flex-shrink-0 w-[80px] sm:w-[90px] md:w-[100px] lg:w-[120px] h-[120px] sm:h-[135px] md:h-[150px] lg:h-[180px] rounded-lg bg-light dark:bg-dark border-2 border-dashed border-dark dark:border-light cursor-pointer flex items-center justify-center transition-all duration-300`}
          >
            <IconLibraryPhoto
              className={`w-8 h-8 group-hover/new:scale-110 text-dark dark:text-light transition-all duration-300 ease-in-out`}
            />
          </div>
        )}

        {/* Photos */}
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => showPhotoFullscreen(photo.photo_url, index)}
            className="group/image relative flex-shrink-0 w-[80px] sm:w-[90px] md:w-[100px] lg:w-[120px] h-[120px] sm:h-[135px] md:h-[150px] lg:h-[180px] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out"
          >
            <img
              src={photo.photo_url}
              alt=""
              className={`group-hover/image:scale-110 w-full h-full object-cover transition-all duration-300 ease-in-out`}
            />

            {/* Delete button - Only show on own photos */}
            {isOwnProfile && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoToDelete({ id: photo.id, url: photo.photo_url });
                  setShowDeleteConfirm(true);
                }}
                className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-all duration-300 ease-in-out z-10"
              >
                <IconTrash className="w-6 h-6 p-1 text-white bg-red-500 hover:bg-red-600 rounded-full shadow-md cursor-pointer" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hover Navigation Arrows */}
      {photos.length > 0 && (
        <div
          className={`opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 ease-in-out`}
        >
          <button
            onClick={() => navigateCarousel("left")}
            className={`absolute left-0 top-1/2 -translate-y-1/2 text-dark dark:text-light hover:text-primary opacity-20 hover:opacity-100 transition-all duration-300 ease-in-out z-10`}
          >
            <IconCircleChevronLeftFilled className="w-10 h-10" />
          </button>
          <button
            onClick={() => navigateCarousel("right")}
            className={`absolute right-0 top-1/2 -translate-y-1/2 text-dark/20 dark:text-light/20 hover:text-primary transition-all duration-300 ease-in-out z-10`}
          >
            <IconCircleChevronRightFilled className="w-10 h-10" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && photoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/70">
          <div className="bg-light dark:bg-dark rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-2 text-dark dark:text-light">
                Delete Photo
              </h3>
              <p className="mb-6 text-dark dark:text-light">
                Are you sure you want to delete this photo? This action cannot
                be undone.
              </p>

              {deleteError && (
                <div className="mb-4 p-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setPhotoToDelete(null);
                    setDeleteError("");
                  }}
                  className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-dark dark:text-light hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePhoto}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen view */}
      {showFullScreen && (
        <div className="fixed inset-0 bg-dark/90 z-50 flex items-center justify-center">
          <button
            onClick={() => navigateFullscreen("prev")}
            className={`absolute left-2 top-1/2 -translate-y-1/2 text-light dark:text-dark hover:text-primary transition-all duration-300 ease-in-out`}
          >
            <IconCircleChevronLeftFilled className="w-10 h-10" />
          </button>

          <img
            src={fullscreenImage}
            alt="User photo"
            className="max-w-full max-h-full object-contain"
          />

          <button
            onClick={() => navigateFullscreen("next")}
            className={`absolute right-2 top-1/2 -translate-y-1/2 text-light dark:text-dark hover:text-primary transition-all duration-300 ease-in-out`}
          >
            <IconCircleChevronRightFilled className="w-10 h-10" />
          </button>

          <button
            onClick={() => setShowFullScreen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full bg-dark/30 hover:bg-dark/50 transition-all"
          >
            <IconX className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
