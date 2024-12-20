"use client";

import ErrorUi from "@/components/blocks/error";
import LoadingBlock from "@/components/blocks/loadingBlock";
import CloudinaryUpload from "@/components/reuseble/upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import authClient from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

interface Testimonial {
  id: number;
  name: string;
  testimony: string;
  orgName: string;
  role: string;
  imageUrl: string; // Cloudinary URL will be set after upload
  userId: string;
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;

export default function TestimonialsPage() {
  const queryClient = useQueryClient();
  const session = authClient.useSession();
  const [editingTestimonialId, setEditingTestimonialId] = useState<
    number | null
  >(null);
  const [newTestimonial, setNewTestimonial] = useState<Testimonial>({
    id: 0,
    name: "",
    testimony: "",
    orgName: "",
    role: "",
    imageUrl: "", // Reset imageUrl
    userId: session.data?.user.id ?? "",
  });

  const {
    data: testimonials,
    isLoading,
    isError,
    // refetch,
  } = useQuery<Testimonial[] | undefined>({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const response = await axios.get(
        `${backendUrl}/public/testimony/${session.data?.user.id}`,
        { withCredentials: true }
      );
      return response.data;
    },
    enabled: !!session.data?.user.id,
  });

  const saveTestimonialMutation = useMutation({
    mutationFn: async (testimonial: Testimonial) => {
      const { id, ...restTestimonial } = testimonial;
      // Handle submission to backend (create or update)
      if (id) {
        return axios.patch(
          `${backendUrl}/testimony/${id}`,
          { ...restTestimonial },
          {
            withCredentials: true,
          }
        );
      } else {
        return axios.post(
          `${backendUrl}/testimony`,
          { ...restTestimonial },
          {
            withCredentials: true,
          }
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      resetForm();
    },
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: async (id: number) => {
      return axios.delete(`${backendUrl}/testimony/${id}`, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewTestimonial((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveTestimonialMutation.mutate(newTestimonial);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setNewTestimonial(testimonial);
    setEditingTestimonialId(testimonial.id);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      deleteTestimonialMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setNewTestimonial({
      id: 0,
      name: "",
      testimony: "",
      orgName: "",
      role: "",
      imageUrl: "", // Reset imageUrl
      userId: session.data?.user.id ?? "",
    });
    setEditingTestimonialId(null);
  };

  const handleImageUploadSuccess = (url: string) => {
    setNewTestimonial((prev) => ({ ...prev, imageUrl: url })); // Set the image URL in the form
  };

  if (isLoading) {
    return <LoadingBlock />;
  }

  if (isError) {
    return <ErrorUi />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium">Manage Testimonials</h1>

      <Card className="md:max-w-[95%] w-full rounded-sm dark:bg-white/5 dark:border-white/5">
        <CardHeader>
          <CardTitle>
            {editingTestimonialId ? "Edit Testimonial" : "Add Testimonial"}
          </CardTitle>
          <CardDescription>
            {editingTestimonialId
              ? "Update the testimonial details"
              : "Add a new testimonial"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={newTestimonial.name}
                onChange={handleInputChange}
                required
                className="py-1 px-2"
              />
            </div>

            <div>
              <Label htmlFor="testimony">Testimony</Label>
              <Textarea
                id="testimony"
                name="testimony"
                value={newTestimonial.testimony}
                onChange={handleInputChange}
                required
                className="py-1 px-2"
              />
            </div>

            <div>
              <Label htmlFor="orgName">Organization</Label>
              <Input
                id="orgName"
                name="orgName"
                value={newTestimonial.orgName}
                onChange={handleInputChange}
                required
                className="py-1 px-2"
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                name="role"
                value={newTestimonial.role}
                onChange={handleInputChange}
                required
                className="py-1 px-2"
              />
            </div>

            <CloudinaryUpload onUploadSuccess={handleImageUploadSuccess} />

            <CardFooter className="gap-3">
              <Button
                type="submit"
                disabled={saveTestimonialMutation.isPending}
              >
                {editingTestimonialId ? "Update" : "Add"}
              </Button>
              {editingTestimonialId && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Edit
                </Button>
              )}
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      <div className=" flex flex-row gap-4 flex-wrap w-[98%] ">
        {testimonials?.map((testimonial) => (
          <Card
            key={testimonial.id}
            className="dark:bg-white/5 w-[320px] rounded-sm dark:border-white/5 border"
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.imageUrl as string}
                  alt={testimonial.name}
                  height={200}
                  width={200}
                  className=" h-12 w-12 rounded-full object-cover shadow-lg transition-transform duration-500 hover:scale-105"
                  draggable={false}
                />

                <div>
                  <CardTitle>{testimonial.name}</CardTitle>
                  <CardDescription>
                    {testimonial.role} at {testimonial.orgName}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className=" font-normal text-sm text-black dark:text-white/70 dark:font-normal">
                {testimonial.testimony}
              </p>
            </CardContent>
            <CardFooter className="gap-3">
              <Button onClick={() => handleEdit(testimonial)}>Edit</Button>
              <Button
                className=" bg-red-500 dark:text-white hover:bg-red-500"
                onClick={() => handleDelete(testimonial.id)}
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
