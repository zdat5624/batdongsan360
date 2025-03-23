package vn.thanhdattanphuoc.batdongsan360.config;

import java.io.InputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import vn.thanhdattanphuoc.batdongsan360.domain.Category;
import vn.thanhdattanphuoc.batdongsan360.domain.Image;
import vn.thanhdattanphuoc.batdongsan360.domain.Notification;
import vn.thanhdattanphuoc.batdongsan360.domain.Post;
import vn.thanhdattanphuoc.batdongsan360.domain.Transaction;
import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.domain.Vip;
import vn.thanhdattanphuoc.batdongsan360.domain.address.District;
import vn.thanhdattanphuoc.batdongsan360.domain.address.DistrictDTO;
import vn.thanhdattanphuoc.batdongsan360.domain.address.Province;
import vn.thanhdattanphuoc.batdongsan360.domain.address.ProvinceDTO;
import vn.thanhdattanphuoc.batdongsan360.domain.address.Ward;
import vn.thanhdattanphuoc.batdongsan360.domain.address.WardDTO;
import vn.thanhdattanphuoc.batdongsan360.repository.*;
import vn.thanhdattanphuoc.batdongsan360.repository.address.DistrictRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.address.ProvinceRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.address.WardRepository;
import vn.thanhdattanphuoc.batdongsan360.service.UserService;
import vn.thanhdattanphuoc.batdongsan360.util.constant.GenderEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.NotificationType;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostStatusEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostTypeEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.RoleEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.TransStatusEnum;

@Component
public class StartupRunner implements CommandLineRunner {

    private final NotificationRepository notificationRepository;
    private final VipRepository vipRepository;
    private final ProvinceRepository provinceRepository;
    private final DistrictRepository districtRepository;
    private final WardRepository wardRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepository;
    private final UserService userService;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public StartupRunner(VipRepository vipRepository, ProvinceRepository provinceRepository,
            DistrictRepository districtRepository, WardRepository wardRepository, PasswordEncoder passwordEncoder,
            CategoryRepository categoryRepository, UserService userService, PostRepository postRepository,
            UserRepository userRepository, TransactionRepository transactionRepository,
            NotificationRepository notificationRepository) {
        this.vipRepository = vipRepository;
        this.provinceRepository = provinceRepository;
        this.districtRepository = districtRepository;
        this.wardRepository = wardRepository;
        this.passwordEncoder = passwordEncoder;
        this.categoryRepository = categoryRepository;
        this.userService = userService;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void run(String... args) {

        System.out.println(">>> START INIT DATABASE");

        System.out.println(">>> INIT TABLE 'users': 1 ADMIN, 50 USER");
        List<User> userList = new ArrayList<>();

        // Thêm user admin mẫu
        User adminUser = new User();
        adminUser.setEmail("admin@gmail.com");
        adminUser.setName("Quản trị viên");
        adminUser.setPassword(this.passwordEncoder.encode("123456"));
        adminUser.setRole(RoleEnum.ADMIN);
        adminUser.setGender(GenderEnum.MALE);
        adminUser.setBalance(999999999);
        adminUser.setPhone("0123456789");
        adminUser.setAddress("Thành Phố Hồ Chí Minh");
        userList.add(adminUser);

        // Tạo 100 user mẫu với thông tin ngẫu nhiên
        for (int i = 1; i <= 50; i++) {
            User user = new User();
            user.setEmail("user" + i + "@gmail.com");
            user.setName("TestUser" + i);
            user.setPassword(this.passwordEncoder.encode("123456"));
            user.setRole(RoleEnum.USER);
            user.setGender(i % 2 == 0 ? GenderEnum.MALE : GenderEnum.FEMALE);
            user.setBalance(1000000 * i); // Số dư tăng dần
            user.setPhone("01234567" + String.format("%02d", i));
            user.setAddress(i % 2 == 0 ? "Thành Phố Hồ Chí Minh" : "Thành Phố Hà Nội");
            userList.add(user);
        }

        for (User user : userList) {
            boolean isEmailExist = this.userService.isEmailExist(user.getEmail());
            if (!isEmailExist) {
                this.userService.handleCreateUser(user);
            }
        }

        // Kiểm tra nếu database table provinces,dictrics,wars đã có dữ liệu thì không
        // init
        if (this.provinceRepository.count() > 0 || this.districtRepository.count() > 0
                || this.wardRepository.count() > 0) {
            System.out.println(
                    ">>> SKIP! INIT ADDRESS DATA TABLE 'provinces', 'districs', 'wards': ALREADY HAVE DATA ... ");
        } else {
            try {

                ObjectMapper objectMapper = new ObjectMapper();

                try (InputStream inputStream = new ClassPathResource("/data/address.json").getInputStream()) {
                    List<ProvinceDTO> provinceDTOs = objectMapper.readValue(inputStream,
                            new TypeReference<List<ProvinceDTO>>() {
                            });

                    for (ProvinceDTO provinceDTO : provinceDTOs) {
                        Province province = convertToEntity(provinceDTO);
                        provinceRepository.save(province);
                    }
                    System.out.println(">>> INIT ADDRESS DATA TABLE provinces, districs, wards: SUCCESS");
                } catch (Exception e) {
                    e.printStackTrace();
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        initSampleCategories();

        initSampleVips();

        initSamplePosts();

        initSampleTransactions();

        initSampleNotifications();

    }

    private void initSampleCategories() {
        if (categoryRepository.count() > 0) {
            System.out.println(">>> SKIP! INIT ADDRESS DATA TABLE category: ALREADY HAVE DATA ... ");
            return;
        }

        ArrayList<Category> lst = new ArrayList<Category>();
        lst.add(new Category("Cho thuê căn hộ chung cư", PostTypeEnum.RENT));
        lst.add(new Category("Cho thuê chung cư mini, căn hộ dịch vụ", PostTypeEnum.RENT));
        lst.add(new Category("Cho thuê nhà riêng", PostTypeEnum.RENT));
        lst.add(new Category("Cho thuê nhà biệt thự, liền kề", PostTypeEnum.RENT));
        lst.add(new Category("Cho thuê nhà mặt phố", PostTypeEnum.RENT));
        lst.add(new Category("Cho thuê shophouse, nhà phố thương mại", PostTypeEnum.RENT));
        lst.add(new Category("Cho thuê nhà trọ, phòng trọ", PostTypeEnum.RENT));
        lst.add(new Category("Cho thuê văn phòng", PostTypeEnum.RENT));
        lst.add(new Category("Cho thuê, sang nhượng cửa hàng, ki ốt", PostTypeEnum.RENT));
        lst.add(new Category("Cho thuê kho, nhà xưởng, đất", PostTypeEnum.RENT));
        lst.add(new Category("Cho thuê loại bất động sản khác", PostTypeEnum.RENT));

        lst.add(new Category("Bán căn hộ chung cư", PostTypeEnum.SALE));
        lst.add(new Category("Bán chung cư mini, căn hộ dịch vụ", PostTypeEnum.SALE));
        lst.add(new Category("Bán nhà riêng", PostTypeEnum.SALE));
        lst.add(new Category("Bán nhà biệt thự, liền kề", PostTypeEnum.SALE));
        lst.add(new Category("Bán nhà mặt phố", PostTypeEnum.SALE));
        lst.add(new Category("Bán shophouse, nhà phố thương mại", PostTypeEnum.SALE));
        lst.add(new Category("Bán đất nền dự án", PostTypeEnum.SALE));
        lst.add(new Category("Bán đất", PostTypeEnum.SALE));
        lst.add(new Category("Bán trang trại, khu nghỉ dưỡng", PostTypeEnum.SALE));
        lst.add(new Category("Bán condotel", PostTypeEnum.SALE));
        lst.add(new Category("Bán kho, nhà xưởng", PostTypeEnum.SALE));
        lst.add(new Category("Bán loại bất động sản khác", PostTypeEnum.SALE));

        this.categoryRepository.saveAll(lst);

        System.out.println(">>> INIT ADDRESS DATA TABLE 'categories' : SUCCESS");

    }

    private void initSampleVips() {
        if (vipRepository.count() > 0) {
            System.out.println(">>> SKIP! INIT ADDRESS DATA TABLE vips: ALREADY HAVE DATA ... ");
            return;
        }

        ArrayList<Vip> lst = new ArrayList<Vip>();
        lst.add(new Vip(0, "VIP 0", 0));
        lst.add(new Vip(1, "VIP 1", 3000));
        lst.add(new Vip(2, "VIP 2", 4000));
        lst.add(new Vip(3, "VIP 3", 5000));
        lst.add(new Vip(4, "VIP 4", 7000));

        this.vipRepository.saveAll(lst);

        System.out.println(">>> INIT ADDRESS DATA TABLE 'vips' : SUCCESS");

    }

    private void initSamplePosts() {
        if (postRepository.count() > 0) {
            System.out.println(">>> SKIP! INIT ADDRESS DATA TABLE posts: ALREADY HAVE DATA ... ");
            return;
        }
        Random random = new Random();

        // Lấy danh sách dữ liệu từ các bảng khác
        List<User> users = userRepository.findAll();
        List<Category> categories = categoryRepository.findAll();
        List<Province> provinces = provinceRepository.findAll();
        List<Vip> vips = vipRepository.findAll();

        // Danh sách các trạng thái cho các level VIP > 0 (loại bỏ PENDING)
        List<PostStatusEnum> nonPendingStatuses = new ArrayList<>(Arrays.asList(
                PostStatusEnum.REVIEW_LATER,
                PostStatusEnum.APPROVED,
                PostStatusEnum.REJECTED,
                PostStatusEnum.EXPIRED));

        List<Post> posts = new ArrayList<>();

        for (int i = 1; i <= 45000; i++) {
            Post post = new Post();
            Category selectedCategory = categories.get(random.nextInt(categories.size()));
            Vip selectedVip = vips.get(random.nextInt(vips.size()));

            double rawArea = 50 + random.nextDouble() * 2000;
            double roundedArea = Math.round(rawArea * 10.0) / 10.0;
            post.setArea(roundedArea);

            // Gán địa chỉ trước switch-case
            Province selectedProvince = provinces.get(random.nextInt(provinces.size()));
            post.setProvince(selectedProvince);
            List<District> districtsInProvince = districtRepository.findByProvinceCode(selectedProvince.getCode());
            District selectedDistrict = null;
            Ward selectedWard = null;
            if (!districtsInProvince.isEmpty()) {
                selectedDistrict = districtsInProvince.get(random.nextInt(districtsInProvince.size()));
                post.setDistrict(selectedDistrict);
                List<Ward> wardsInDistrict = wardRepository.findByDistrictCode(selectedDistrict.getCode());
                if (!wardsInDistrict.isEmpty()) {
                    selectedWard = wardsInDistrict.get(random.nextInt(wardsInDistrict.size()));
                    post.setWard(selectedWard);
                }
            }
            String detailAddress = null;

            // Tạo chuỗi địa chỉ đầy đủ
            String fullAddress = (selectedWard != null ? selectedWard.getName() : "") +
                    (selectedDistrict != null ? ", " + selectedDistrict.getName() : "") +
                    ", " + selectedProvince.getName();

            String title = "";
            String description = "";
            List<String> sampleImageUrls = new ArrayList<>();

            switch (selectedCategory.getName()) {
                case "Cho thuê căn hộ chung cư":
                    title = String.format("Cho Thuê Căn Hộ Chung Cư 2 Phòng Ngủ %s m2 Gần Trung Tâm", roundedArea);
                    description = String.format(
                            "Cho thuê căn hộ chung cư cao cấp, diện tích %s m2, gồm 2 phòng ngủ rộng rãi và 1 phòng khách thoáng mát. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "chungcucaocap (1).jpg",
                            "chungcucaocap (2).jpg", "chungcucaocap (3).jpg", "chungcucaocap (4).jpg",
                            "chungcucaocap (5).jpg", "chungcucaocap (6).jpg", "canhochungcu (1).jpg",
                            "canhochungcu (2).jpg", "canhochungcu (3).jpg", "canhochungcu (4).jpg",
                            "canhochungcu (5).jpg", "canhochungcu (6).jpg", "canhochungcu (7).jpg",
                            "canhochungcu (8).jpg", "canhochungcu (9).jpg", "canhochungcu (10).jpg",
                            "canhochungcu (11).jpg");
                    break;
                case "Cho thuê chung cư mini, căn hộ dịch vụ":
                    title = String.format("Cho Thuê Chung Cư Mini %s m2 Gần Trường Đại Học", roundedArea);
                    description = String.format(
                            "Cho thuê chung cư mini tiện nghi, diện tích %s m2, gồm 1 phòng ngủ ấm cúng. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "chungcu (1).jpg",
                            "chungcu (2).jpg", "chungcu (3).jpg", "chungcu (4).jpg", "chungcu (5).jpg",
                            "chungcu (6).jpg", "canhochungcumini (1).jpg", "canhochungcumini (2).jpg",
                            "canhochungcumini (3).jpg", "canhochungcumini (4).jpg", "canhochungcumini (5).jpg",
                            "canhochungcumini (6).jpg", "canhochungcumini (7).jpg", "canhochungcumini (8).jpg",
                            "canhochungcumini (9).jpg", "canhochungcumini (10).jpg", "canhochungcumini (11).jpg",
                            "canhochungcumini (12).jpg", "canhochungcumini (13).jpg", "canhochungcumini (14).jpg");
                    break;
                case "Cho thuê nhà riêng":
                    title = String.format("Cho Thuê Nhà Riêng 3 Tầng %s m2 Có Gara Ô Tô", roundedArea);
                    description = String.format(
                            "Nhà riêng cho thuê, 3 tầng khang trang, diện tích %s m2, gồm 4 phòng ngủ rộng rãi. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "chothuenharieng (1).jpg", "chothuenharieng (2).jpg", "chothuenharieng (3).jpg",
                            "chothuenharieng (4).jpg", "chothuenharieng (5).jpg", "chothuenharieng (6).jpg",
                            "chothuenharieng (7).jpg", "banthuenharieng (1).jpg", "banthuenharieng (2).jpg",
                            "banthuenharieng (3).jpg", "banthuenharieng (4).jpg", "banthuenharieng (5).jpg",
                            "banthuenharieng (6).jpg",
                            "banthuenharieng (7).jpg", "banthuenharieng (8).jpg", "banthuenharieng (9).jpg",
                            "banthuenharieng (10).jpg");
                    break;
                case "Cho thuê nhà biệt thự, liền kề":
                    title = String.format("Cho Thuê Biệt Thự Liền Kề %s m2 Có Hồ Bơi Riêng", roundedArea);
                    description = String.format(
                            "Cho thuê biệt thự liền kề đẳng cấp, diện tích %s m2, thiết kế sang trọng. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "bietthulienke (1).jpg", "bietthulienke (2).jpg", "bietthulienke (3).jpg",
                            "bietthulienke (4).jpg", "bietthulienke (5).jpg", "bietthulienke (6).jpg",
                            "bietthulienke (7).jpg", "bietthulienke (8).jpg", "bietthulienke (9).jpg");
                    break;
                case "Cho thuê nhà mặt phố":
                    title = String.format("Cho Thuê Nhà Mặt Phố %s m2 Vị Trí Kinh Doanh Đắc Địa", roundedArea);
                    description = String.format(
                            "Nhà mặt phố cho thuê, diện tích %s m2, 2 tầng rộng rãi. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "chothuenhamatpho (1).jpg", "chothuenhamatpho (2).jpg", "chothuenhamatpho (3).jpg",
                            "chothuenhamatpho (4).jpg", "chothuenhamatpho (5).jpg", "chothuenhamatpho (6).jpg",
                            "chothuenhamatpho (7).jpg", "chothuenhamatpho (8).jpg", "chothuenhamatpho (9).jpg");
                    break;
                case "Cho thuê shophouse, nhà phố thương mại":
                    title = String.format("Cho Thuê Shophouse %s m2 Mặt Tiền Rộng Khu Đô Thị Mới", roundedArea);
                    description = String.format(
                            "Cho thuê shophouse hiện đại, diện tích %s m2, thiết kế 3 tầng tối ưu. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "chothueshophouse (1).jpg", "chothueshophouse (2).jpg", "chothueshophouse (3).jpg",
                            "chothueshophouse (4).jpg", "chothueshophouse (5).jpg", "chothueshophouse (6).jpg",
                            "chothueshophouse (7).jpg", "chothueshophouse (8).jpg");
                    break;
                case "Cho thuê nhà trọ, phòng trọ":
                    title = String.format("Cho Thuê Phòng Trọ %s m2 Sạch Sẽ Gần Trường Đại Học", roundedArea);
                    description = String.format(
                            "Phòng trọ cho thuê sạch sẽ, diện tích %s m2, thiết kế gọn gàng. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "nhatrophongtro (1).jpg", "nhatrophongtro (2).jpg", "nhatrophongtro (3).jpg",
                            "nhatrophongtro (4).jpg", "nhatrophongtro (5).jpg", "nhatrophongtro (6).jpg",
                            "nhatrophongtro (7).jpg", "nhatrophongtro (8).jpg");
                    break;
                case "Cho thuê văn phòng":
                    title = String.format("Cho Thuê Văn Phòng %s m2 Hiện Đại Tại Trung Tâm", roundedArea);
                    description = String.format(
                            "Văn phòng cho thuê chuyên nghiệp, diện tích %s m2, không gian mở hiện đại. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "chothuevanphong (1).jpg", "chothuevanphong (2).jpg", "chothuevanphong (3).jpg",
                            "chothuevanphong (4).jpg", "chothuevanphong (5).jpg", "chothuevanphong (6).jpg",
                            "chothuevanphong (7).jpg", "chothuevanphong (8).jpg");
                    break;
                case "Cho thuê, sang nhượng cửa hàng, ki ốt":
                    title = String.format("Cho Thuê hoặc Sang Nhượng Cửa Hàng %s m2 Đang Kinh Doanh", roundedArea);
                    description = String.format(
                            "Cho thuê hoặc sang nhượng cửa hàng, diện tích %s m2, mặt tiền rộng 4m. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "chothuecuahankiot (1).jpg", "chothuecuahankiot (2).jpg", "chothuecuahankiot (3).jpg",
                            "chothuecuahankiot (4).jpg", "chothuecuahankiot (5).jpg", "chothuecuahankiot (6).jpg",
                            "chothuecuahankiot (7).jpg", "chothuecuahankiot (8).jpg", "chothuecuahankiot (9).jpg");
                    break;
                case "Cho thuê kho, nhà xưởng, đất":
                    title = String.format("Cho Thuê Kho Bãi %s m2 Gần Khu Công Nghiệp", roundedArea);
                    description = String.format(
                            "Cho thuê kho bãi rộng rãi, diện tích %s m2, kết cấu khung thép chắc chắn. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "chothuenhakhonhaxuong (1).jpg", "chothuenhakhonhaxuong (2).jpg",
                            "chothuenhakhonhaxuong (3).jpg", "chothuenhakhonhaxuong (4).jpg",
                            "chothuenhakhonhaxuong (5).jpg", "chothuenhakhonhaxuong (6).jpg",
                            "chothuenhakhonhaxuong (7).jpg", "chothuenhakhonhaxuong (8).jpg");
                    break;
                case "Cho thuê loại bất động sản khác":
                    title = String.format("Cho Thuê Mặt Bằng Đa Năng %s m2 Linh Hoạt Sử Dụng", roundedArea);
                    description = String.format(
                            "Cho thuê mặt bằng đa năng, diện tích %s m2, vị trí linh hoạt. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "batdongsankhac (1).jpg", "batdongsankhac (2).jpg", "batdongsankhac (3).jpg",
                            "batdongsankhac (4).jpg", "batdongsankhac (5).jpg", "bdskhac (1).jpg", "bdskhac (2).jpg",
                            "bdskhac (3).jpg", "bdskhac (4).jpg", "bdskhac (5).jpg", "bdskhac (6).jpg");
                    break;

                case "Bán căn hộ chung cư":
                    title = String.format("Bán Căn Hộ Chung Cư 3 Phòng Ngủ %s m2 View Công Viên", roundedArea);
                    description = String.format(
                            "Bán căn hộ chung cư cao cấp, diện tích %s m2, gồm 3 phòng ngủ rộng rãi. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "chungcucaocap (1).jpg",
                            "chungcucaocap (2).jpg", "chungcucaocap (3).jpg", "chungcucaocap (4).jpg",
                            "chungcucaocap (5).jpg", "chungcucaocap (6).jpg", "canhochungcu (1).jpg",
                            "canhochungcu (2).jpg", "canhochungcu (3).jpg", "canhochungcu (4).jpg",
                            "canhochungcu (5).jpg", "canhochungcu (6).jpg", "canhochungcu (7).jpg",
                            "canhochungcu (8).jpg", "canhochungcu (9).jpg", "canhochungcu (10).jpg",
                            "canhochungcu (11).jpg");
                    break;
                case "Bán chung cư mini, căn hộ dịch vụ":
                    title = String.format("Bán Chung Cư Mini %s m2 Đang Cho Thuê Ổn Định", roundedArea);
                    description = String.format(
                            "Bán chung cư mini sinh lời cao, diện tích %s m2, gồm 1 phòng ngủ khép kín. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "chungcu (1).jpg",
                            "chungcu (2).jpg", "chungcu (3).jpg", "chungcu (4).jpg", "chungcu (5).jpg",
                            "chungcu (6).jpg", "canhochungcumini (1).jpg", "canhochungcumini (2).jpg",
                            "canhochungcumini (3).jpg", "canhochungcumini (4).jpg", "canhochungcumini (5).jpg",
                            "canhochungcumini (6).jpg", "canhochungcumini (7).jpg", "canhochungcumini (8).jpg",
                            "canhochungcumini (9).jpg", "canhochungcumini (10).jpg", "canhochungcumini (11).jpg",
                            "canhochungcumini (12).jpg", "canhochungcumini (13).jpg", "canhochungcumini (14).jpg");
                    break;
                case "Bán nhà riêng":
                    title = String.format("Bán Nhà Riêng 4 Tầng %s m2 Hẻm Xe Hơi Yên Tĩnh", roundedArea);
                    description = String.format(
                            "Bán nhà riêng 4 tầng kiên cố, diện tích %s m2, gồm 3 phòng ngủ rộng. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "chothuenharieng (1).jpg", "chothuenharieng (2).jpg", "chothuenharieng (3).jpg",
                            "chothuenharieng (4).jpg", "chothuenharieng (5).jpg", "chothuenharieng (6).jpg",
                            "chothuenharieng (7).jpg", "banthuenharieng (1).jpg", "banthuenharieng (2).jpg",
                            "banthuenharieng (3).jpg", "banthuenharieng (4).jpg", "banthuenharieng (5).jpg",
                            "banthuenharieng (6).jpg",
                            "banthuenharieng (7).jpg", "banthuenharieng (8).jpg", "banthuenharieng (9).jpg",
                            "banthuenharieng (10).jpg");
                    break;
                case "Bán nhà biệt thự, liền kề":
                    title = String.format("Bán Biệt Thự Liền Kề %s m2 5 Phòng Ngủ Sang Trọng", roundedArea);
                    description = String.format(
                            "Bán biệt thự liền kề đẳng cấp, diện tích %s m2, thiết kế 4 tầng. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "bietthulienke (1).jpg", "bietthulienke (2).jpg", "bietthulienke (3).jpg",
                            "bietthulienke (4).jpg", "bietthulienke (5).jpg", "bietthulienke (6).jpg",
                            "bietthulienke (7).jpg", "bietthulienke (8).jpg", "bietthulienke (9).jpg");
                    break;
                case "Bán nhà mặt phố":
                    title = String.format("Bán Nhà Mặt Phố 3 Tầng %s m2 Vị Trí Kinh Doanh Vàng", roundedArea);
                    description = String.format(
                            "Bán nhà mặt phố 3 tầng, diện tích %s m2, mặt tiền 5m lý tưởng. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "chothuenhamatpho (1).jpg", "chothuenhamatpho (2).jpg", "chothuenhamatpho (3).jpg",
                            "chothuenhamatpho (4).jpg", "chothuenhamatpho (5).jpg", "chothuenhamatpho (6).jpg",
                            "chothuenhamatpho (7).jpg", "chothuenhamatpho (8).jpg", "chothuenhamatpho (9).jpg");
                    break;
                case "Bán shophouse, nhà phố thương mại":
                    title = String.format("Bán Shophouse 4 Tầng %s m2 Khu Thương Mại Sầm Uất", roundedArea);
                    description = String.format(
                            "Bán shophouse hiện đại, diện tích %s m2, 4 tầng tối ưu. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "chothueshophouse (1).jpg", "chothueshophouse (2).jpg", "chothueshophouse (3).jpg",
                            "chothueshophouse (4).jpg", "chothueshophouse (5).jpg", "chothueshophouse (6).jpg",
                            "chothueshophouse (7).jpg", "chothueshophouse (8).jpg");
                    break;
                case "Bán đất nền dự án":
                    title = String.format("Bán Đất Nền Dự Án %s m2 Hạ Tầng Hoàn Thiện", roundedArea);
                    description = String.format(
                            "Bán đất nền dự án vị trí đẹp, diện tích %s m2, nằm trong khu đô thị mới. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "bandatnenduan (1).jpg",
                            "bandatnenduan (2).jpg",
                            "bandatnenduan (3).jpg",
                            "bandatnenduan (4).jpg",
                            "bandatnenduan (5).jpg",
                            "bandatnenduan (6).jpg",
                            "bandatnenduan (7).jpg",
                            "bandatnenduan (8).jpg",
                            "bandatnenduan (9).jpg",
                            "bandatnenduan (10).jpg");
                    break;
                case "Bán đất":
                    title = String.format("Bán Lô Đất %s m2 Mặt Tiền Đường Lớn Gần Trung Tâm", roundedArea);
                    description = String.format(
                            "Bán lô đất đẹp, diện tích %s m2, mặt tiền đường lớn 10m. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "bandat (1).jpg",
                            "bandat (2).jpg",
                            "bandat (3).jpg",
                            "bandat (4).jpg",
                            "bandat (5).jpg",
                            "bandat (6).jpg",
                            "bandat (7).jpg",
                            "bandat (8).jpg",
                            "bandat (9).jpg",
                            "bandat (10).jpg",
                            "bandat (11).jpg",
                            "bandat (12).jpg",
                            "bandat (13).jpg");
                    break;
                case "Bán trang trại, khu nghỉ dưỡng":
                    title = String.format("Bán Trang Trại Nghỉ Dưỡng %s m2 Có Ao Cá và Vườn Cây", roundedArea);
                    description = String.format(
                            "Bán trang trại nghỉ dưỡng, diện tích %s m2, gồm nhà nghỉ 2 tầng. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "bantrangtrainghiduong (1).jpg",
                            "bantrangtrainghiduong (2).jpg",
                            "bantrangtrainghiduong (3).jpg",
                            "bantrangtrainghiduong (4).jpg",
                            "bantrangtrainghiduong (5).jpg",
                            "bantrangtrainghiduong (6).jpg",
                            "bantrangtrainghiduong (7).jpg",
                            "bantrangtrainghiduong (8).jpg",
                            "bantrangtrainghiduong (9).jpg",
                            "bantrangtrainghiduong (10).jpg",
                            "bantrangtrainghiduong (11).jpg",
                            "bantrangtrainghiduong (12).jpg");
                    break;
                case "Bán condotel":
                    title = String.format("Bán Condotel %s m2 View Biển Đẳng Cấp 5 Sao", roundedArea);
                    description = String.format(
                            "Bán condotel view biển đẳng cấp, diện tích %s m2, gồm 2 phòng ngủ. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "condotel (1).jpg",
                            "condotel (2).jpg",
                            "condotel (3).jpg",
                            "condotel (4).jpg",
                            "condotel (5).jpg",
                            "condotel (6).jpg",
                            "condotel (7).jpg",
                            "condotel (8).jpg");
                    break;
                case "Bán kho, nhà xưởng":
                    title = String.format("Bán Nhà Xưởng %s m2 Gần Khu Công Nghiệp Có Điện 3 Pha", roundedArea);
                    description = String.format(
                            "Bán nhà xưởng kiên cố, diện tích %s m2, khung thép chắc chắn. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "chothuenhakhonhaxuong (1).jpg", "chothuenhakhonhaxuong (2).jpg",
                            "chothuenhakhonhaxuong (3).jpg", "chothuenhakhonhaxuong (4).jpg",
                            "chothuenhakhonhaxuong (5).jpg", "chothuenhakhonhaxuong (6).jpg",
                            "chothuenhakhonhaxuong (7).jpg", "chothuenhakhonhaxuong (8).jpg");
                    break;
                case "Bán loại bất động sản khác":
                    title = String.format("Bán Tài Sản Đặc Biệt %s m2 Vị Trí Độc Đáo Đa Năng", roundedArea);
                    description = String.format(
                            "Bán tài sản đặc biệt, diện tích %s m2, vị trí độc đáo. Địa chỉ: %s.",
                            roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "batdongsankhac (1).jpg", "batdongsankhac (2).jpg", "batdongsankhac (3).jpg",
                            "batdongsankhac (4).jpg", "batdongsankhac (5).jpg");
                    break;
                default:
                    title = String.format("Bài Đăng Mẫu %d - %s m2", i, roundedArea);
                    description = String.format(
                            "Mô tả mặc định cho bài đăng mẫu %d, diện tích %s m2. Địa chỉ: %s.",
                            i, roundedArea, fullAddress);
                    sampleImageUrls = Arrays.asList(
                            "https://example.com/images/default1.jpg",
                            "https://example.com/images/default2.jpg");
                    break;
            }
            post.setTitle(title);
            post.setDescription(description);

            post.setType(selectedCategory.getType());

            // Gán giá dựa trên loại bài đăng (RENT hoặc SALE)
            if (selectedCategory.getType() == PostTypeEnum.RENT) {
                long minRentPrice = 1_700_000L;
                long maxRentPrice = 40_000_000L;
                long rentPriceRange = maxRentPrice - minRentPrice;
                post.setPrice(minRentPrice + (long) (random.nextDouble() * rentPriceRange));
            } else if (selectedCategory.getType() == PostTypeEnum.SALE) {
                long minPricePerM2 = 100_000L;
                long maxPricePerM2 = 10_000_000L;
                long pricePerM2Range = maxPricePerM2 - minPricePerM2;
                long pricePerM2 = minPricePerM2 + (long) (random.nextDouble() * pricePerM2Range);
                post.setPrice((long) (roundedArea * pricePerM2));
            }

            post.setView(random.nextInt(10000));

            // Kiểm tra vipLevel để gán trạng thái và thời gian hiệu lực
            if (selectedVip.getVipLevel() == 0) {
                post.setStatus(PostStatusEnum.PENDING);
                long secondsIn1Month = 30L * 24 * 60 * 60;
                long secondsIn3Months = 90L * 24 * 60 * 60;
                long range = secondsIn3Months - secondsIn1Month;
                post.setExpireDate(Instant.now().plusSeconds(secondsIn1Month + (long) (random.nextDouble() * range)));
                post.setNotifyOnView(false);
            } else {
                PostStatusEnum selectedStatus = nonPendingStatuses.get(random.nextInt(nonPendingStatuses.size()));
                post.setStatus(selectedStatus);

                if (selectedStatus == PostStatusEnum.EXPIRED) {
                    long secondsInPast = random.nextInt(30) * 24 * 60 * 60 + 1;
                    post.setExpireDate(Instant.now().minusSeconds(secondsInPast));
                } else {
                    long secondsIn1Month = 30L * 24 * 60 * 60;
                    long secondsIn3Months = 90L * 24 * 60 * 60;
                    long range = secondsIn3Months - secondsIn1Month;
                    post.setExpireDate(
                            Instant.now().plusSeconds(secondsIn1Month + (long) (random.nextDouble() * range)));
                    post.setNotifyOnView(true);
                }
            }

            post.setDeletedByUser(false);

            // Liên kết với các entity khác
            User user = users.get(random.nextInt(users.size()));
            post.setUser(user);
            post.setCreatedBy(user.getEmail());
            post.setCategory(selectedCategory);
            post.setVip(selectedVip);
            post.setDetailAddress(detailAddress);

            // Tạo danh sách ảnh mẫu
            List<Image> images = new ArrayList<>();
            int numberOfImages = random.nextInt(sampleImageUrls.size()) + 1;
            for (int j = 0; j < numberOfImages; j++) {
                Image image = new Image();
                image.setUrl(sampleImageUrls.get(random.nextInt(sampleImageUrls.size())));
                image.setOrderIndex(j);
                image.setPost(post);
                images.add(image);
            }
            post.setImages(images);

            posts.add(post);
        }

        postRepository.saveAll(posts);

        System.out.println(">>> INIT ADDRESS DATA TABLE 'posts' WITH IMAGES : SUCCESS");
    }

    private void initSampleTransactions() {
        if (transactionRepository.count() > 0) {
            System.out.println(">>> SKIP! INIT DATA TABLE 'transactions': ALREADY HAVE DATA ... ");
            return;
        }

        Random random = new Random();
        List<User> users = userRepository.findAll();
        List<Transaction> transactions = new ArrayList<>();
        List<TransStatusEnum> statuses = Arrays.asList(TransStatusEnum.PENDING, TransStatusEnum.SUCCESS,
                TransStatusEnum.FAILED);

        // Tạo 200 giao dịch mẫu
        for (int i = 1; i <= 5000; i++) {
            Transaction transaction = new Transaction();

            // Gán user ngẫu nhiên
            User selectedUser = users.get(random.nextInt(users.size()));
            transaction.setUser(selectedUser);

            // Lấy danh sách Post của user này
            List<Post> userPosts = postRepository.findByUser(selectedUser); // Giả định có phương thức này trong
                                                                            // PostRepository

            // Quyết định loại giao dịch: nạp tiền (50%) hoặc thanh toán phí đăng tin (50%)
            boolean isDeposit = random.nextBoolean();
            long amount;
            String description = "";
            String txnId = "TXN" + String.format("%06d", i) + Instant.now().toEpochMilli();

            if (isDeposit || userPosts.isEmpty()) { // Nếu không có Post hoặc là giao dịch nạp tiền
                // Giao dịch nạp tiền
                long minAmount = 50_000L;
                long maxAmount = 10_000_000L;
                long amountRange = maxAmount - minAmount;
                amount = minAmount + (long) (random.nextDouble() * amountRange); // Số tiền dương
                TransStatusEnum selectedStatus = statuses.get(random.nextInt(statuses.size()));
                transaction.setStatus(selectedStatus);

                switch (selectedStatus) {
                    case PENDING:
                        description = "Giao dịch nạp tiền đang chờ thanh toán";
                        break;
                    case SUCCESS:
                        description = "Giao dịch nạp tiền thành công";
                        break;
                    case FAILED:
                        description = "Giao dịch nạp tiền thất bại";
                        break;
                }
                transaction.setPaymentLink("https://payment.example.com/txn/" + txnId);
            } else {

                Post selectedPost = userPosts.get(random.nextInt(userPosts.size()));
                long minCost = 10_000L;
                long maxCost = 1_000_000L;
                long costRange = maxCost - minCost;
                amount = -(minCost + (long) (random.nextDouble() * costRange));
                transaction.setStatus(TransStatusEnum.SUCCESS);
                description = "Thanh toán phí đăng tin " + selectedPost.getId() + " thành công";
                transaction.setPaymentLink(null);
                txnId = null;
            }

            transaction.setAmount(amount);
            transaction.setDescription(description);
            transaction.setTxnId(txnId);

            // Thời gian tạo (ngẫu nhiên trong 30 ngày qua)
            long secondsIn30Days = 30L * 24 * 60 * 60;
            long randomSeconds = (long) (random.nextDouble() * secondsIn30Days);
            transaction.setCreatedAt(Instant.now().minusSeconds(randomSeconds));

            // Thời gian cập nhật (nếu SUCCESS hoặc FAILED thì có updatedAt)
            if (transaction.getStatus() != TransStatusEnum.PENDING) {
                transaction.setUpdatedAt(transaction.getCreatedAt().plusSeconds(random.nextInt(3600 / 4)));
            }

            transactions.add(transaction);
        }

        transactionRepository.saveAll(transactions);
        System.out.println(">>> INIT DATA TABLE 'transactions' WITH DEPOSIT AND POST FEE: SUCCESS");
    }

    private void initSampleNotifications() {
        if (notificationRepository.count() > 0) {
            System.out.println(">>> SKIP! INIT DATA TABLE 'notifications': ALREADY HAVE DATA ... ");
            return;
        }

        Random random = new Random();
        List<User> users = userRepository.findAll();
        List<Post> posts = postRepository.findAll();
        List<Transaction> transactions = transactionRepository.findAll();
        List<Notification> notifications = new ArrayList<>();

        for (int i = 1; i <= 5000; i++) {
            Notification notification = new Notification();

            User selectedUser = users.get(random.nextInt(users.size()));
            notification.setUser(selectedUser);

            // Chọn loại thông báo ngẫu nhiên (4 loại)
            int notificationTypeIndex = random.nextInt(4);
            String message = "";
            NotificationType type;

            switch (notificationTypeIndex) {
                case 0: // Người dùng xem bài đăng
                    if (posts.isEmpty())
                        continue;
                    Post viewedPost = posts.get(random.nextInt(posts.size()));
                    User viewer = users.get(random.nextInt(users.size()));
                    message = "Người dùng [" + viewer.getName() + ", phone=" + viewer.getPhone() +
                            ", gender=" + viewer.getGender() + "] đã xem bài đăng " + viewedPost.getId() + " của bạn.";
                    type = NotificationType.POST;
                    notification.setUser(viewedPost.getUser());
                    break;

                case 1: // Bài đăng được chấp nhận
                    if (posts.isEmpty())
                        continue;
                    Post approvedPost = posts.get(random.nextInt(posts.size()));
                    message = "Bài đăng '" + approvedPost.getId() + "' của bạn đã được kiểm duyệt viên chấp nhận.";
                    type = NotificationType.SYSTEM_ALERT;
                    notification.setUser(approvedPost.getUser());
                    break;

                case 2: // Bài đăng bị từ chối
                    if (posts.isEmpty())
                        continue;
                    Post rejectedPost = posts.get(random.nextInt(posts.size()));
                    message = "Bài đăng '" + rejectedPost.getId() + "' của bạn đã bị kiểm duyệt viên từ chối.";
                    type = NotificationType.SYSTEM_ALERT;
                    notification.setUser(rejectedPost.getUser());
                    break;

                case 3:
                    if (transactions.isEmpty())
                        continue;
                    Transaction successfulTransaction = transactions.stream()
                            .filter(t -> t.getStatus() == TransStatusEnum.SUCCESS && t.getAmount() > 0)
                            .findAny()
                            .orElse(null);
                    if (successfulTransaction == null)
                        continue;
                    message = "Giao dịch nạp tiền thành công, tài khoản cộng " + successfulTransaction.getAmount();
                    type = NotificationType.TRANSACTION;
                    notification.setUser(successfulTransaction.getUser());
                    break;

                default:
                    continue;
            }

            notification.setMessage(message);
            notification.setType(type);
            notification.setRead(random.nextBoolean());

            long secondsIn30Days = 30L * 24 * 60 * 60;
            long randomSeconds = (long) (random.nextDouble() * secondsIn30Days);
            notification.setCreatedAt(Instant.now().minusSeconds(randomSeconds));

            notifications.add(notification);
        }

        notificationRepository.saveAll(notifications);
        System.out.println(">>> INIT DATA TABLE 'notifications': SUCCESS");
    }

    public Province convertToEntity(ProvinceDTO provinceDTO) {
        Province province = new Province();
        province.setCode(provinceDTO.getCode());
        province.setName(provinceDTO.getName());
        province.setCodename(provinceDTO.getCodename());
        province.setDivisionType(provinceDTO.getDivisionType());
        province.setPhoneCode(provinceDTO.getPhoneCode());

        if (provinceDTO.getDistricts() != null) {
            List<District> districtEntities = new ArrayList<>();
            for (DistrictDTO districtDTO : provinceDTO.getDistricts()) {
                District district = new District();
                district.setCode(districtDTO.getCode());
                district.setName(districtDTO.getName());
                district.setCodename(districtDTO.getCodename());
                district.setDivisionType(districtDTO.getDivisionType());
                district.setShortCodename(districtDTO.getShortCodename());
                district.setProvince(province);

                if (districtDTO.getWards() != null) {
                    List<Ward> wardEntities = new ArrayList<>();
                    for (WardDTO wardDTO : districtDTO.getWards()) {
                        Ward ward = new Ward();
                        ward.setCode(wardDTO.getCode());
                        ward.setName(wardDTO.getName());
                        ward.setCodename(wardDTO.getCodename());
                        ward.setDivisionType(wardDTO.getDivisionType());
                        ward.setShortCodename(wardDTO.getShortCodename());
                        ward.setDistrict(district);
                        wardEntities.add(ward);
                    }
                    district.setWards(wardEntities);
                }
                districtEntities.add(district);
            }
            province.setDistricts(districtEntities);
        }
        return province;
    }

}
