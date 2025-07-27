import app from './app';

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`Validator-service rodando na porta ${PORT}`);
});
