import GuideSection from "../../components/GuideSection/GuideSection";

const Guides = () => {
  return (
    <div>
      <GuideSection
        title="Зупинка кровотечі"
        content="Першочергове завдання – врятувати життя постраждалого..."
        checklist={[
          "Одягни рукавички",
          "Визнач місце кровотечі",
          "Наклади турнікет вище рани",
          "Занотуй час накладання"
        ]}
        image="https://via.placeholder.com/400x200"
        videoUrl="https://www.youtube.com/embed/8wlChEAYyYQ"
        tip="Не накладай турнікет поверх кишень або жорстких предметів!"
      />
      
     

    </div>
  );
};

export default Guides;
