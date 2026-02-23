"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import {
  IconLibraryPhoto,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconCircleChevronLeftFilled,
  IconCircleChevronRightFilled,
  IconTrash,
  IconAlertTriangle,
  IconFlag,
} from "@tabler/icons-react";
import { updateRiskLevel } from "@/utils/moderation";
import ReportButton from "@/components/report-button";
import { User } from "@supabase/supabase-js";

// Define types
type UserPhoto = {
  id: string;
  user_id: string;
  photo_url: string;
  created_at: string;
};

type SightEngineResponse = {
  status: string;
  nudity?: {
    sexual_activity: number;
    sexual_display: number;
    erotica: number;
    very_suggestive: number;
    suggestive: number;
    mildly_suggestive: number;
    none: number;
  };
  recreational_drug?: {
    prob: number;
  };
  medical?: {
    prob: number;
  };
  gore?: {
    prob: number;
  };
  "self-harm"?: {
    prob: number;
  };
  weapon?: number;
  violence?: number;
};

export default function UserPhotosCarousel({
  userId,
  currentUser,
}: {
  userId: string;
  currentUser: User;
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

  const [uploadStatus, setUploadStatus] = useState<{
    isUploading: boolean;
    message: string;
    type: "info" | "success" | "error" | "warning";
  }>({
    isUploading: false,
    message: "",
    type: "info",
  });

  const carouselRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isOwnProfile = userId === currentUser.id;

  // ... (keep all the existing useEffect and handler functions exactly the same)

  useEffect(() => {
    const fetchUserPhotos = async () => {
      setIsLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("profile_photos")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPhotos(data);
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

  // Helper function to determine risk level and reason from Sightengine response
  const analyzeModerationResult = (result: SightEngineResponse) => {
    const violations = [];
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";

    // Check nudity
    if (result.nudity) {
      if (
        result.nudity.sexual_activity > 0.8 ||
        result.nudity.sexual_display > 0.8
      ) {
        violations.push("Explicit sexual content");
        riskLevel = "critical";
      } else if (
        result.nudity.erotica > 0.6 ||
        result.nudity.very_suggestive > 0.6
      ) {
        violations.push("Highly suggestive content");
        riskLevel = updateRiskLevel("high", riskLevel);
      } else if (result.nudity.suggestive > 0.6) {
        violations.push("Suggestive content");
        riskLevel = updateRiskLevel("medium", riskLevel);
      }
    }

    // Check other violations
    if (result.weapon && result.weapon > 0.6) {
      violations.push("Weapon detected");
      riskLevel = updateRiskLevel("high", riskLevel);
    }

    if (result.recreational_drug?.prob && result.recreational_drug.prob > 0.6) {
      violations.push("Drug-related content");
      riskLevel = updateRiskLevel("medium", riskLevel);
    }

    if (result.gore?.prob && result.gore.prob > 0.6) {
      violations.push("Gore/violent content");
      riskLevel = updateRiskLevel("critical", riskLevel);
    }

    if (result["self-harm"]?.prob && result["self-harm"].prob > 0.6) {
      violations.push("Self-harm content");
      riskLevel = updateRiskLevel("critical", riskLevel);
    }

    if (result.violence && result.violence > 0.6) {
      violations.push("Violent content");
      riskLevel = updateRiskLevel("high", riskLevel);
    }

    return {
      hasViolations: violations.length > 0,
      reason: violations.join(", "),
      riskLevel,
    };
  };

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

      setUploadStatus({
        isUploading: true,
        message: "Uploading and checking image...",
        type: "info",
      });

      try {
        // First, upload the file to storage
        const fileExt = file.name.split(".").pop();
        const filePath = `${currentUser.id}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("user.photos")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from("user.photos")
          .getPublicUrl(filePath);

        const photoUrl = publicUrlData.publicUrl;

        // Now check with Sightengine
        setUploadStatus({
          isUploading: true,
          message: "Checking image content...",
          type: "info",
        });

        const formData = new FormData();
        formData.append("media", file);
        formData.append(
          "models",
          "nudity-2.1,weapon,recreational_drug,gore-2.0,violence,self-harm",
        );
        formData.append(
          "api_user",
          process.env.NEXT_PUBLIC_SIGHTENGINE_API_USER!,
        );
        formData.append(
          "api_secret",
          process.env.NEXT_PUBLIC_SIGHTENGINE_API_SECRET!,
        );

        const moderationResponse = await fetch(
          "https://api.sightengine.com/1.0/check.json",
          {
            method: "POST",
            body: formData,
          },
        );

        const moderationResult: SightEngineResponse =
          await moderationResponse.json();

        const analysis = analyzeModerationResult(moderationResult);

        if (analysis.hasViolations) {
          // Create moderation record
          const { error: moderationError } = await supabase
            .from("images_moderation")
            .insert([
              {
                image_url: photoUrl,
                uploaded_by: currentUser.id,
                reported_by: null, // System-triggered
                reason: analysis.reason,
                risk_level: analysis.riskLevel,
                sightengine_data: moderationResult,
              },
            ]);

          if (moderationError) {
            // Error handled silently
          }

          setUploadStatus({
            isUploading: false,
            message:
              "Image flagged for review. It will be reviewed by our moderation team.",
            type: "warning",
          });

          // Clean up the uploaded file since it won't be added to profile_photos
          await supabase.storage.from("user.photos").remove([filePath]);
        } else {
          // Image is safe, add to profile_photos
          const { data: photoData, error: photoError } = await supabase
            .from("profile_photos")
            .insert([
              {
                user_id: currentUser.id,
                photo_url: photoUrl,
              },
            ])
            .select()
            .single();

          if (photoError) throw photoError;

          // Update local state with the new photo
          setPhotos((prevPhotos) => [photoData, ...prevPhotos]);

          setUploadStatus({
            isUploading: false,
            message: "Photo uploaded successfully!",
            type: "success",
          });
        }
      } catch (error: unknown) {
        let errorMessage = "Failed to upload photo. Please try again.";

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (
          typeof error === "object" &&
          error !== null &&
          "message" in error
        ) {
          errorMessage = (error as { message: string }).message;
        }

        setUploadStatus({
          isUploading: false,
          message: errorMessage,
          type: "error",
        });
      }

      // Clear the status message after 5 seconds
      setTimeout(() => {
        setUploadStatus({
          isUploading: false,
          message: "",
          type: "info",
        });
      }, 5000);
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
        .from("profile_photos")
        .delete()
        .eq("id", photoToDelete.id);

      if (dbError) throw dbError;

      // Update local state
      setPhotos(photos.filter((photo) => photo.id !== photoToDelete.id));
      setShowDeleteConfirm(false);
      setPhotoToDelete(null);
    } catch (error: unknown) {
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
      {/* Upload Status Message */}
      {uploadStatus.message && (
        <div
          className={`mb-3 p-3 rounded-lg flex items-center gap-2 ${
            uploadStatus.type === "success"
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              : uploadStatus.type === "error"
                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                : uploadStatus.type === "warning"
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
          }`}
        >
          {uploadStatus.type === "warning" && (
            <IconAlertTriangle className="w-5 h-5" />
          )}
          <span className="text-sm">{uploadStatus.message}</span>
          {uploadStatus.isUploading && (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      )}

      {/* Carousel */}
      <div
        ref={carouselRef}
        className={`w-full overflow-x-auto scrollbar-hide flex gap-2`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Upload button (only for own profile) */}
        {isOwnProfile && (
          <div
            onClick={uploadStatus.isUploading ? undefined : handleUploadPhoto}
            className={`group/new flex-shrink-0 w-[80px] sm:w-[90px] md:w-[100px] lg:w-[120px] h-[120px] sm:h-[135px] md:h-[150px] lg:h-[180px] rounded-lg bg-light dark:bg-dark border-2 border-dashed border-dark dark:border-light ${
              uploadStatus.isUploading
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            } flex items-center justify-center transition-all duration-300`}
          >
            {uploadStatus.isUploading ? (
              <div className="w-8 h-8 border-2 border-dark dark:border-light border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <IconLibraryPhoto
                className={`w-8 h-8 group-hover/new:scale-110 text-dark dark:text-light transition-all duration-300 ease-in-out`}
              />
            )}
          </div>
        )}

        {/* Photos */}
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => showPhotoFullscreen(photo.photo_url, index)}
            className="group/image relative flex-shrink-0 w-[80px] sm:w-[90px] md:w-[100px] lg:w-[120px] h-[120px] sm:h-[135px] md:h-[150px] lg:h-[180px] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out"
          >
            <Image
              src={photo.photo_url}
              alt=""
              fill
              className={`group-hover/image:scale-110 object-cover transition-all duration-300 ease-in-out`}
              unoptimized
            />

            {/* Action buttons - Top right corner */}
            <div className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-all duration-300 ease-in-out z-10 flex gap-1">
              {isOwnProfile ? (
                // Delete button for own photos
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoToDelete({ id: photo.id, url: photo.photo_url });
                    setShowDeleteConfirm(true);
                  }}
                  className="cursor-pointer"
                  aria-label="Delete photo"
                >
                  <IconTrash className="w-6 h-6 p-1 text-white bg-red-500 hover:bg-red-600 rounded-full shadow-md" />
                </button>
              ) : (
                // Report button for other users' photos
                <div onClick={(e) => e.stopPropagation()}>
                  <ReportButton
                    type="image"
                    targetId={photo.photo_url}
                    currentUser={currentUser}
                    className="bg-red-500 hover:bg-red-600 rounded-full shadow-md text-white"
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Rest of the component remains the same... */}

      {/* Hover Navigation Arrows */}
      {photos.length > 0 && (
        <div
          className={`opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 ease-in-out`}
        >
          <button
            onClick={() => navigateCarousel("left")}
            className={`absolute left-0 top-1/2 -translate-y-1/2 text-dark dark:text-light hover:text-primary opacity-20 hover:opacity-100 transition-all duration-300 ease-in-out z-10`}
            aria-label="Scroll photos left"
          >
            <IconCircleChevronLeftFilled className="w-10 h-10" />
          </button>
          <button
            onClick={() => navigateCarousel("right")}
            className={`absolute right-0 top-1/2 -translate-y-1/2 text-dark/20 dark:text-light/20 hover:text-primary transition-all duration-300 ease-in-out z-10`}
            aria-label="Scroll photos right"
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
            aria-label="Previous photo"
          >
            <IconCircleChevronLeftFilled className="w-10 h-10" />
          </button>

          <div className="relative w-full h-full">
            <Image
              src={fullscreenImage}
              alt="User photo"
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          <button
            onClick={() => navigateFullscreen("next")}
            className={`absolute right-2 top-1/2 -translate-y-1/2 text-light dark:text-dark hover:text-primary transition-all duration-300 ease-in-out`}
            aria-label="Next photo"
          >
            <IconCircleChevronRightFilled className="w-10 h-10" />
          </button>

          <button
            onClick={() => setShowFullScreen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full bg-dark/30 hover:bg-dark/50 transition-all"
            aria-label="Close fullscreen"
          >
            <IconX className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
