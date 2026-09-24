import OpenAI from "openai";
import Sql from "../config/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

/*  const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});  */

// Function to genearate Article
/*  export const generateArticle = async (req,res)=>{ 
  try {
    const {userId} = req.auth();
    const {prompt,length} = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if(plan !== 'premium' && free_usage >=10){
      return res.json({success: false , message: "Limit reached. Upgrade to continue."})
    }
    
    const response = await AI.chat.completions.create({
    model: "gemini-3-flash-preview",
    messages: [
        {
            role: "user",
            content: prompt,
        },
    ],
    temperature: 0.7,
    max_tokens: length
});
   
   const content = response.choices[0].message.content
   
   await Sql `INSERT INTO creations (user_id, prompt, content, type)
   VALUES (${userId}, ${prompt}, ${content}, 'article')`;
   
   if(plan !== 'premium'){
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata:{
          free_usage: free_usage +1
      }
    })
   } 

    res.json({success: true, content})

  } catch (error) {
    console.log(error.message);
    res.json({success:false, message:error.message})
  }
}  */

// Function to generate Article
const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({ success: false, message: "Limit reached" });
    }

    const tokens = Math.floor(length * 1.8);

    const response = await AI.chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [
        {
          role: "user",
          content: `Write a detailed article of at least ${length} words with headings.\n\n${prompt}`,
        },
      ],
      max_tokens: tokens,
    });

    const content = response.choices[0].message.content;

    await Sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Function to generate Blog Title
export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const rawContent = response?.choices?.[0]?.message?.content?.trim() || "";

    const parseTitles = (text) => {
      const numberedLines = [];
      text.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^\s*(\d+)[\.|\)]\s*(.*)$/);
        if (match) {
          const title = match[2].trim();
          if (title.length > 0) {
            numberedLines.push(`${match[1]}. ${title}`);
          }
        }
      });
      if (numberedLines.length >= 2) return numberedLines;

      const inlineMatches = [
        ...text.matchAll(/(\d+)[\.|\)]\s*([^\d\n]+?)(?=(?:\d+[\.|\)]|$))/g),
      ];
      const filteredInline = inlineMatches
        .map((m) => ({ idx: m[1], title: m[2].trim() }))
        .filter((x) => x.title.length > 0)
        .map((x) => `${x.idx}. ${x.title}`);
      if (filteredInline.length >= 2) {
        return filteredInline;
      }

      const lineItems = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(
          (l) =>
            l &&
            !/^\s*(here are|to improve|titles?)\b/i.test(l) &&
            !/^\s*\d+[\.|\)]\s*/.test(l),
        );

      if (lineItems.length >= 2) return lineItems;

      return [];
    };

    const makeFallback = (promptText) => {
      const keyMatch = promptText.match(/keyword\s*"([^"]+)"/i);
      const catMatch = promptText.match(/category\s*"([^"]+)"/i);
      const keyword = keyMatch ? keyMatch[1] : "Your Topic";
      const category = catMatch ? catMatch[1] : "General";

      return [
        `1. Mastering ${keyword}: A Guide for Modern ${category}`,
        `2. 10 ${category} Insights for ${keyword} Enthusiasts`,
        `3. ${keyword} Strategies to Level Up Your ${category} Game`,
        `4. The Future of ${keyword} in ${category} Innovation`,
        `5. Quick Wins: ${keyword} Tips for ${category} Impact`,
      ];
    };

    const parsedTitles = parseTitles(rawContent);

    let finalTitles;
    if (parsedTitles.length >= 5) {
      finalTitles = parsedTitles.slice(0, 5);
    } else if (parsedTitles.length > 0) {
      // Pad with minimal placeholders only
      finalTitles = [...parsedTitles];
      while (finalTitles.length < 5) {
        finalTitles.push(`${finalTitles.length + 1}. [Loading more titles...]`);
      }
    } else {
      // No titles found - return raw content if it exists, else error
      if (rawContent.length > 0) {
        finalTitles = [rawContent];
      } else {
        finalTitles = [
          "1. Unable to generate titles. Please try again with different keywords.",
        ];
      }
    }

    const content = finalTitles.slice(0, 5).join("\n");
    /*  console.log("generateBlogTitle rawResponse:", rawContent);
    console.log("generateBlogTitle parsedCount:", parsedTitles.length);
    console.log("generateBlogTitle normalizedContent:", content); */

    await Sql`INSERT INTO creations (user_id, prompt, content, type)
   VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Function to genearate Images
export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: " This feature is only available for prmium subscriptions",
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
        responseType: "arraybuffer",
      },
    );

    const base64Image = `data:image/png;base64,${Buffer.from(
      data,
      "binary",
    ).toString("base64")}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await Sql`INSERT INTO creations (user_id, prompt, content, type, publish)
   VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Function to remove background
export const removeBackgroundImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: " This feature is only available for prmium subscriptions",
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background",
        },
      ],
    });

    await Sql`INSERT INTO creations (user_id, prompt, content, type)
   VALUES (${userId}, 'Remove background from image' , ${secure_url}, 'image')`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Function to remove object from image
export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: " This feature is only available for prmium subscriptions",
      });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    await Sql`INSERT INTO creations (user_id, prompt, content, type)
   VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Function for resume review
export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: " This feature is only available for prmium subscriptions",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds allowed size(5MB).",
      });
    }

    // Extract text from PDF
    let textContent = "Sample resume text for AI review.";

    const prompt = `You are an experienced professional resume reviewer with 15+ years of HR and hiring experience. 
    
Please provide a comprehensive and detailed analysis of the following resume. Write naturally as if you were speaking to the candidate directly. 

Format your response with these three sections:

## 🌟 Key Strengths & Positive Aspects
Analyze and discuss 4-6 specific strengths of this resume. For each strength, explain why it's valuable and how it stands out. Provide examples of what was done well and how it could impress potential employers. Write 150-200 words total in this section, being specific and detailed about each strength.

## ⚠️ Weaknesses & Areas of Concern  
Identify and discuss 4-6 significant weaknesses or missing elements. For each weakness, explain the impact it has on the resume's effectiveness and why employers might be concerned. Discuss specific issues like formatting, content gaps, clarity issues, or missed opportunities. Write 150-200 words total in this section, being constructive and fair.

## 🚀 Detailed Recommendations for Improvement
Provide 5-7 specific, actionable recommendations to significantly improve this resume. For each recommendation, explain:
- What needs to be changed or added
- Why this change matters
- How to implement it effectively
- The expected impact on resume effectiveness

Write 200-250 words total in this section with detailed, practical advice.

Remember to:
- Be encouraging yet honest
- Provide specific, actionable feedback
- Use professional language
- Focus on making the resume more competitive
- Consider current job market trends

Resume to Review:
${textContent}`;

    const response = await AI.chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 2500,
    });

    const content = response.choices[0].message.content;

    await Sql`INSERT INTO creations (user_id, prompt, content, type)
   VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
