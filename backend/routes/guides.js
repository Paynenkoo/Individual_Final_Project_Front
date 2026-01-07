import express from 'express';
import Guide from '../models/Guide';

const router = express.Router();

router.ger("/", async (req,res) => {
    try{
        const guides = await Guide.find();
        res.json(guides);
        } catch (error) {
        res.status(500).json({message: "Помилка сервера"});
    }
});

router.post("/",async (req,res) => {
    const {title, content, category, images} = req.body;

    try{
        const newGuide = new Guide({
            title,
            content,
            category,
            images,
        });

        const savedGuide = await newGuide.save();
        res.status(201).json(savedGuide);
    } catch (error){
        res.status(500).json({message: "Помилка при створенні"});
    }
});

router.get("/:id",async (req, res) => {
    try {
        const guide = await Guide.findById(req.params.id);
        if(!guide) {
            return res.status(404).json({message:"Гід не знайдено"});
        }
        res.json(guide);
    } catch (error) {
        res.status(500).json({message:"Помилка сервера"});
    }
});

router.delete("/:id", async (req, res) => {
    try {
      const guide = await Guide.findByIdAndDelete(req.params.id);
      if (!guide) {
        return res.status(404).json({ message: "Гід не знайдено" });
      }
      res.json({ message: "Гід видалено" });
    } catch (error) {
      res.status(500).json({ message: "Помилка сервера" });
    }
});

export default router;