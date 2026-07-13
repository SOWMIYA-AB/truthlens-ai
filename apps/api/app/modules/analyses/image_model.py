from pathlib import Path

from app.core.config import settings

IMAGE_SIZE = 300
LABELS = ("Likely Authentic", "Likely AI Generated")


class EfficientNetB3ImageAuthenticityModel:
    def __init__(self) -> None:
        self.model_name = "EfficientNet-B3"
        self._model = None
        self._transform = None
        self._torch = None
        self._device = None

    def _load(self) -> None:
        if self._model is not None:
            return

        import timm
        import torch
        from torchvision import transforms

        self._torch = torch
        self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        torch.manual_seed(42)

        model = timm.create_model(settings.image_analysis_model_name, pretrained=False, num_classes=2)
        checkpoint_path = settings.resolved_image_analysis_checkpoint
        if checkpoint_path:
            state = torch.load(checkpoint_path, map_location=self._device)
            model.load_state_dict(state.get("model_state_dict", state))

        model.to(self._device)
        model.eval()
        self._model = model
        self._transform = transforms.Compose(
            [
                transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
                transforms.ToTensor(),
                transforms.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
            ]
        )

    def predict(self, image_path: Path) -> dict:
        self._load()

        from PIL import Image

        with Image.open(image_path) as image:
            tensor = self._transform(image.convert("RGB")).unsqueeze(0).to(self._device)

        with self._torch.no_grad():
            logits = self._model(tensor)
            probabilities = self._torch.softmax(logits, dim=1)[0].detach().cpu().numpy()

        predicted_index = int(probabilities.argmax())
        confidence = round(float(probabilities[predicted_index]) * 100, 2)
        truth_score = confidence if predicted_index == 0 else round(100 - confidence, 2)

        return {
            "prediction": LABELS[predicted_index],
            "confidence": confidence,
            "truthScore": truth_score,
            "model": self.model_name,
        }


image_authenticity_model = EfficientNetB3ImageAuthenticityModel()

